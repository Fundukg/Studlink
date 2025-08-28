import { PrismaClient } from '@prisma/client'
import bot, { sendMessageToStudent } from '.'

const prisma = new PrismaClient()

// Функция для поиска chat_id по student_id
export const getChatIdByStudentId = async (studentId: string): Promise<string | null> => {
  const student = await prisma.student.findUnique({
    where: { student_id: studentId },
    select: { telegramChatId: true },
  })

  return student?.telegramChatId || null
}

// Функция для массовой отправки сообщений
export const sendBulkMessages = async (studentIds: string[], message: string) => {
  const results = await Promise.allSettled(studentIds.map((id) => sendMessageToStudent(id, message)))

  return results
}

// Добавьте эту функцию в utils.ts
export const sendDistributionWithReply = async (
  studentId: string,
  message: string,
  distributionId: string,
  staffId?: string
) => {
  try {
    const student = await prisma.student.findUnique({
      where: { student_id: studentId },
    })

    if (!student || !student.telegramChatId) {
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
    const telegramMessage = await bot.telegram.sendMessage(student.telegramChatId, message, {
      reply_markup: replyMarkup,
    })

    // Сохраняем сообщение в базу
    // await prisma.message.create({
    //   data: {
    //     text: message,
    //     senderType: 'STAFF',
    //     staffId: staffId,
    //     recipientStudentId: student.id,
    //     externalId: telegramMessage.message_id.toString(),
    //     parentId: distributionId, // Связываем с родительской рассылкой
    //   },
    // })

    return true
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error)
    throw error
  }
}
