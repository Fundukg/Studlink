import { BotPlatform } from '@prisma/client'
import axios from 'axios'
import { botService } from '../botService'
import { handleOkWebhook } from './index'

const BASE_URL = 'https://api.ok.ru/graph'

export class OkBotPoller {
  private isRunning: boolean = false
  private isSubscribed: boolean = false

  /**
   * Активация подписки (нужна для работы /me/updates)
   */
  private async subscribe(token: string) {
    try {
      await axios.post(
        `${BASE_URL}/me/subscribe`,
        {
          types: ['MESSAGE_CREATED', 'MESSAGE_CALLBACK', 'CHAT_SYSTEM'],
          longPolling: true,
        },
        {
          params: { access_token: token },
          headers: { 'Content-Type': 'application/json;charset=utf-8' },
        }
      )
      this.isSubscribed = true
      console.log('✅ OK: Подписка на обновления активирована')
    } catch (error) {
      console.error('❌ OK: Ошибка активации подписки:', error)
    }
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️ OK бот уже запущен')
      return
    }

    this.isRunning = true

    // Запускаем цикл в фоне
    this.poll().catch((err) => {
      console.error('❌ Критическая ошибка в цикле OK бота:', err)
      this.isRunning = false
    })

    console.log('✅ OK бот успешно запущен и слушает сообщения')
  }

  private async poll() {
    while (this.isRunning) {
      try {
        const token = await botService.getBotToken(BotPlatform.OK)
        if (!token) {
          throw new Error('Токен ОК не найден')
        }

        if (!this.isSubscribed) {
          await this.subscribe(token)
        }

        const response = await axios.get(`${BASE_URL}/me/updates`, {
          params: { access_token: token },
        })

        const updates = response.data.updates || []

        for (const update of updates) {
          if (update.webhookType === 'MESSAGE_CREATED') {
            await handleOkWebhook({
              sender: update.sender,
              recipient: update.recipient,
              message: update.message,
              timestamp: update.timestamp,
            }).catch((e) => console.error('Ошибка в handleOkWebhook:', e))
          }
        }
      } catch (error: any) {
        if (error.response?.data?.error_code === 5000) {
          this.isSubscribed = false
        }
        console.error('Ошибка Polling ОК:', error.message)
      }

      await new Promise((resolve) => setTimeout(resolve, 3000))
    }
  }

  stop() {
    this.isRunning = false
    console.log('🛑 OK бот остановлен')
  }
}

export const startOkBot = new OkBotPoller()
