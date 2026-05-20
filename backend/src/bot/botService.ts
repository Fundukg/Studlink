/* eslint-disable node/no-process-env */
// botService.ts
import { BotPlatform } from '@prisma/client'
import { prisma } from '../lib/prisma'

type BotConfig = {
  platform: BotPlatform
  token: string | undefined
  enabled: boolean // Здесь строго boolean
  name: string
}

export const botService = {
  syncBotsWithEnv: async () => {
    // Вспомогательная функция для превращения строки "true" в true
    const toBool = (val: string | undefined) => val === 'true'

    const botConfigs: BotConfig[] = [
      {
        platform: BotPlatform.TELEGRAM,
        token: process.env.TELEGRAM_BOT_TOKEN,
        enabled: toBool(process.env.ENABLE_TELEGRAM_BOT),
        name: 'VKurse Telegram Bot',
      },
      {
        platform: BotPlatform.VK,
        token: process.env.VK_BOT_TOKEN,
        enabled: toBool(process.env.ENABLE_VK_BOT),
        name: 'VKurse VK Bot',
      },
      {
        platform: BotPlatform.OK,
        token: process.env.OK_BOT_TOKEN,
        enabled: toBool(process.env.ENABLE_OK_BOT),
        name: 'VKurse OK Bot',
      },
    ]

    for (const config of botConfigs) {
      // Если токена нет, или это стандартная заглушка из .env, пропускаем
      if (!config.token || config.token.includes('your_')) {
        continue
      }

      await prisma.bot.upsert({
        where: { platform: config.platform },
        update: {
          token: config.token,
          isActive: config.enabled, // Теперь сюда летит чистый boolean
          name: config.name,
        },
        create: {
          platform: config.platform,
          token: config.token,
          name: config.name,
          isActive: config.enabled,
        },
      })
    }
    console.log('✅ Конфигурация ботов синхронизирована с БД')
  },
  // Получение токена бота по платформе
  getBotToken: async (platform: BotPlatform): Promise<string> => {
    const bot = await prisma.bot.findUnique({
      where: { platform },
      select: { token: true },
    })

    if (!bot) {
      throw new Error(`Бот для платформы ${platform} не найден`)
    }

    return bot.token
  },

  // Получение информации о боте
  getBotInfo: async (platform: BotPlatform) => {
    const bot = await prisma.bot.findUnique({
      where: { platform },
      include: {
        users: {
          include: {
            student: true,
          },
        },
      },
    })

    if (!bot) {
      throw new Error(`Бот для платформы ${platform} не найден`)
    }

    return bot
  },

  // Регистрация пользователя бота
  registerBotUser: async (studentId: string, platform: BotPlatform, externalId: string) => {
    const bot = await prisma.bot.findUnique({
      where: { platform },
    })

    if (!bot) {
      throw new Error(`Бот для платформы ${platform} не найден`)
    }

    const botUser = await prisma.botUser.upsert({
      where: {
        studentId_botId: {
          studentId,
          botId: bot.id,
        },
      },
      update: {
        externalId,
        isActive: true,
      },
      create: {
        studentId,
        botId: bot.id,
        externalId,
        isActive: true,
      },
    })

    return botUser
  },

  // Получение chat_id по student_id
  getChatIdByStudentId: async (studentId: string, platform: BotPlatform): Promise<string | null> => {
    const bot = await prisma.bot.findUnique({
      where: { platform },
    })

    if (!bot) {
      return null
    }

    const botUser = await prisma.botUser.findFirst({
      where: {
        studentId,
        botId: bot.id,
        isActive: true,
      },
      select: {
        externalId: true,
      },
    })

    return botUser?.externalId || null
  },
}
