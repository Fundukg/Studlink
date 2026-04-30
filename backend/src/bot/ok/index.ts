import { BotPlatform } from '@prisma/client'
import axios from 'axios'
import { prisma } from '../../lib/prisma'
import { botService } from '../botService'

export const sendOkMessage = async (studentId: string, text: string) => {
  const recipientId = await botService.getChatIdByStudentId(studentId, BotPlatform.OK)
  try {
    const token = await botService.getBotToken(BotPlatform.OK)
    const payload = {
      recipient: { chat_id: recipientId },
      message: {
        text: text,
      },
    }
    // console.log('🚀 ~ payload:', payload)
    const response = await axios.post(`https://api.ok.ru/graph/${recipientId}/messages`, payload, {
      params: { access_token: token },
    })

    // console.log('🚀 ~ response.data:', response.data)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Ошибка отправки в ОК:', error)
    return { success: false, error }
  }
}
export const sendOkMessageForNoAuth = async (recipientId: any, text: string) => {
  try {
    const token = await botService.getBotToken(BotPlatform.OK)

    const payload = {
      recipient: recipientId,
      message: {
        text: text,
      },
    }
    // console.log('🚀 ~ payload:', payload)
    const response = await axios.post(`https://api.ok.ru/graph/${recipientId?.chat_id}/messages`, payload, {
      params: { access_token: token },
    })

    // console.log('🚀 ~ response.data:', response.data)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Ошибка отправки в ОК:', error)
    return { success: false, error }
  }
}

export const handleOkWebhook = async (data: any) => {
  // console.log('🚀 ~ data:', data)
  const senderId = data.recipient?.chat_id
  const messageText = data.message?.text?.trim()
  const messageId = data.message?.mid // Используем mid (Message ID)

  const replyChatId = data.recipient

  if (!senderId || !data.message?.text) {
    return
  }

  // 1. Обработка команд (/auth)
  if (messageText.startsWith('/auth')) {
    const studentId = messageText.split(' ')[1]
    if (!studentId) {
      await sendOkMessageForNoAuth(replyChatId, '⚠️ Укажите ваш ID: /auth 12345')
      return
    }

    const student = await prisma.student.findUnique({ where: { student_id: studentId } })
    if (!student) {
      await sendOkMessageForNoAuth(replyChatId, '❌ Студент не найден.')
      return
    }

    await botService.registerBotUser(student.id, BotPlatform.OK, senderId)
    await sendOkMessageForNoAuth(replyChatId, `✅ Успешно! Привет, ${student.name}.`)
    return
  }

  // 2. Логика для авторизованных пользователей
  const botUser = await prisma.botUser.findFirst({
    where: { externalId: senderId, bot: { platform: BotPlatform.OK } },
    include: { student: true, bot: true },
  })

  if (!botUser) {
    await sendOkMessageForNoAuth(replyChatId, 'Введите /auth [ваш_id] для начала работы.')
    return
  }

  // 3. Сохранение в БД
  await prisma.message.create({
    data: {
      text: messageText,
      senderType: 'STUDENT',
      studentId: botUser.student.id,
      targetType: 'STAFF',
      externalId: messageId,
      botId: botUser.bot.id,
      platform: BotPlatform.OK,
    },
  })

  // 4. Подтверждение (опционально, чтобы студент видел, что бот живой)
  await sendOkMessageForNoAuth(replyChatId, '👌 Сообщение передано куратору.')
}
