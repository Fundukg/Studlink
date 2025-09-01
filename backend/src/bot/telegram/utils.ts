// utils.ts
import { PrismaClient, BotPlatform } from '@prisma/client'
import { botService } from '../botService'
import { getBot, sendMessageToStudent } from './index'

const prisma = new PrismaClient()

// Функция для массовой отправки сообщений
export const sendBulkMessages = async (studentIds: string[], message: string) => {
  const results = await Promise.allSettled(
    studentIds.map((id) => sendMessageToStudent(id, message))
  )

  return results
}

// Функция для отправки сообщения с кнопкой "Ответить"
export const sendDistributionWithReply = async (
  studentId: string,
  message: string,
  distributionId: string,
  staffId?: string
) => {
  const bot = getBot()
  
  try {
    // Получаем chat_id из базы данных
    const chatId = await botService.getChatIdByStudentId(studentId, BotPlatform.TELEGRAM)
    
    if (!chatId) {
      throw new Error('Студент не найден или не авторизован в боте')
    }

    // Создаем клавиатуру с кнопкой "Ответить"
    const replyMarkup = {
      inline_keyboard: [
        [
          {
            text: 'Ответить',
            callback_data: `reply_${distributionId}`,
          },
        ],
      ],
    }

    // Отправляем сообщение с кнопкой
    const telegramMessage = await bot.telegram.sendMessage(chatId, message, {
      reply_markup: replyMarkup,
    })

    // Сохраняем сообщение в базу
    await prisma.message.create({
      data: {
        text: message,
        senderType: 'STAFF',
        staffId: staffId,
        targetType: 'STUDENT',
        recipientStudentId: studentId,
        externalId: telegramMessage.message_id.toString(),
        parentId: distributionId,
      },
    })

    return true
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error)
    throw error
  }
}