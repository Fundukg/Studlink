import { BotPlatform, SenderType, UserRole } from '@prisma/client'
import axios from 'axios'
import { prisma } from '../../lib/prisma'
import { authService } from '../authService'
import { botService } from '../botService'

// Переименовали аргумент в userId, так как отправлять можем любому пользователю системы
export const sendOkMessage = async (userId: string, text: string) => {
  const recipientId = await botService.getChatIdByUserId(
    userId,
    BotPlatform.OK
  )
  console.log('recipientId', recipientId)
  if (!recipientId) {
    throw new Error('Пользователь не авторизован в боте')
  }
  try {
    const token = await botService.getBotToken(BotPlatform.OK)
    const payload = {
      recipient: { chat_id: recipientId },
      message: {
        text: text,
      },
    }

    const response = await axios.post(
      `https://api.ok.ru/graph/${recipientId}/messages`,
      payload,
      {
        params: { access_token: token },
      }
    )

    return { success: true, data: response.data }
  } catch (error) {
    console.error('Ошибка отправки в ОК:', error)
    return { success: false, error }
  }
}

export const sendOkMessageForNoAuth = async (
  recipientId: any,
  text: string
) => {
  try {
    const token = await botService.getBotToken(BotPlatform.OK)

    const payload = {
      recipient: recipientId,
      message: {
        text: text,
      },
    }

    const response = await axios.post(
      `https://api.ok.ru/graph/${recipientId?.chat_id}/messages`,
      payload,
      {
        params: { access_token: token },
      }
    )

    return { success: true, data: response.data }
  } catch (error) {
    console.error('Ошибка отправки в ОК:', error)
    return { success: false, error }
  }
}

export const handleOkWebhook = async (data: any) => {
  const senderId = data.recipient?.chat_id
  const replyChatId = data.recipient
  const messageText = data.message?.text?.trim() || ''
  const messageId = data.message?.mid

  const [command, identifier, password] = messageText.split(' ')

  if (!senderId || !data.message?.text) {return}

  // 1. АВТОРИЗАЦИЯ
  if (command === '/auth') {
    if (!identifier) {
      await sendOkMessageForNoAuth(
        replyChatId,
        '⚠️ Укажите ID: /auth [ID] [пароль]'
      )
      return
    }

    const user = await authService.findUser(identifier)
    if (!user) {
      await sendOkMessageForNoAuth(replyChatId, '❌ Пользователь не найден.')
      return
    }

    try {
      const isNewStudent = user.role === 'STUDENT' && !user.password
      if (isNewStudent && !password) {
        await sendOkMessageForNoAuth(
          replyChatId,
          'Для первого входа задайте пароль: /auth [ID] [пароль]'
        )
        return
      }

      await authService.verifyAndSetPassword(
        user.id,
        password || '',
        isNewStudent
      )

      const bot = await prisma.bot.findFirst({
        where: { platform: BotPlatform.OK },
      })
      if (!bot) {throw new Error('Бот не найден')}

      await authService.registerBot(user.id, bot.id, senderId)
      await sendOkMessageForNoAuth(
        replyChatId,
        `✅ Авторизован как ${user.firstName} ${user.lastName}`
      )
    } catch (e) {
      await sendOkMessageForNoAuth(replyChatId, '❌ Неверный пароль.')
    }
    return
  }

  // 2. РАБОТА С СООБЩЕНИЯМИ
  const botUser = await prisma.botUser.findFirst({
    where: { externalId: senderId, bot: { platform: BotPlatform.OK } },
    include: {
      user: {
        include: {
          studentProfile: {
            include: { group: { include: { department: true } } },
          },
        },
      },
      bot: true,
    },
  })

  if (!botUser) {
    await sendOkMessageForNoAuth(
      replyChatId,
      'Введите /auth [ID] [пароль] для начала работы.'
    )
    return
  }

  const user = botUser.user

  // 3. ЛОГИКА ОТПРАВКИ (ИСПОЛЬЗУЕМ УЖЕ ПОЛУЧЕННОГО botUser)
  if (user.role === UserRole.STUDENT) {
    let recipientId: string | null = null
    let responseConfirm = ''
    let textToSave = messageText

    // /prep команда
    if (messageText.startsWith('/prep')) {
      const parts = messageText.split(' ')
      const teacherLastName = parts[1]
      const actualText = parts.slice(2).join(' ')

      if (!teacherLastName || !actualText) {
        await sendOkMessageForNoAuth(
          replyChatId,
          '⚠️ Формат: /prep [Фамилия] [Текст]'
        )
        return
      }

      const teacher = await prisma.user.findFirst({
        where: {
          role: UserRole.TEACHER,
          lastName: { equals: teacherLastName, mode: 'insensitive' },
        },
      })

      if (!teacher) {
        await sendOkMessageForNoAuth(
          replyChatId,
          `❌ Преподаватель "${teacherLastName}" не найден.`
        )
        return
      }

      recipientId = teacher.id
      textToSave = actualText
      responseConfirm = `👌 Сообщение передано: ${teacher.firstName} ${teacher.lastName}.`
    } else {
      // Отправка в деканат
      const facultyId = user.studentProfile?.group?.department?.facultyId
      const deanery = await prisma.user.findFirst({
        where: {
          role: UserRole.DEANERY,
          deaneryProfile: { facultyId: facultyId },
        },
      })
      const admin = !deanery
        ? await prisma.user.findFirst({ where: { role: UserRole.ADMIN } })
        : null

      recipientId = deanery?.id || admin?.id || null
      responseConfirm = deanery
        ? '👌 Сообщение отправлено в Деканат.'
        : '👌 Сообщение передано в администрацию.'
    }

    if (recipientId) {
      await prisma.message.create({
        data: {
          text: textToSave,
          senderType: SenderType.STUDENT,
          senderId: user.id,
          recipientId: recipientId,
          externalId: messageId,
          botId: botUser.bot.id,
          platform: BotPlatform.OK,
        },
      })
      await sendOkMessageForNoAuth(replyChatId, responseConfirm)
    } else {
      await sendOkMessageForNoAuth(replyChatId, '❌ Получатель не найден.')
    }
  }
}
