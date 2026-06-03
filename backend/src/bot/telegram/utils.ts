import { PrismaClient, BotPlatform, SenderType } from '@prisma/client'
import { botService } from '../botService'
import { getBot, sendMessageToStudent } from './index'

const prisma = new PrismaClient()

export const sendBulkMessages = async (
  studentIds: string[],
  message: string
) => {
  const results = await Promise.allSettled(
    studentIds.map((id) => sendMessageToStudent(id, message))
  )
  return results
}

export const sendDistributionWithReply = async (
  studentId: string,
  message: string,
  distributionId: string,
  staffId?: string
) => {
  const bot = getBot()

  try {
    // Получаем chat_id из базы
    const chatId = await botService.getChatIdByUserId(
      studentId,
      BotPlatform.TELEGRAM
    )
    if (!chatId) {
      throw new Error('Студент не найден или не авторизован в боте')
    }

    // Получаем ID записи бота Telegram
    const botRecord = await prisma.bot.findUnique({
      where: { platform: BotPlatform.TELEGRAM },
      select: { id: true },
    })
    if (!botRecord) {
      throw new Error('Бот Telegram не зарегистрирован в системе')
    }

    const replyMarkup = {
      inline_keyboard: [
        [{ text: 'Ответить', callback_data: `reply_${distributionId}` }],
      ],
    }

    const telegramMessage = await bot.telegram.sendMessage(chatId, message, {
      reply_markup: replyMarkup,
    })

    // Сохраняем сообщение в БД
    await prisma.message.create({
      data: {
        text: message,
        senderType: staffId ? SenderType.DEANERY : SenderType.ADMIN,
        senderId: staffId || null,
        recipientId: studentId,
        distributionId: distributionId,
        externalId: telegramMessage.message_id.toString(),
        botId: botRecord.id,
        platform: BotPlatform.TELEGRAM,
      },
    })

    return true
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error)
    throw error
  }
}
