// index.ts
import 'dotenv/config'
import { BotPlatform, SenderType, UserRole } from '@prisma/client'
import { VK } from 'vk-io'
import { prisma } from '../../lib/prisma'
import { getIO } from '../../lib/socket'
import { authService } from '../authService'
import { botService } from '../botService'

let vkInstance: VK | null = null

export const initializeVkBot = async (): Promise<void> => {
  try {
    await botService.syncBotsWithEnv()
    const token = await botService.getBotToken(BotPlatform.VK)

    vkInstance = new VK({
      token: token,
    })

    setupVkHandlers()
  } catch (error) {
    console.error('Ошибка инициализации ВК бота:', error)
    throw error
  }
}

function setupVkHandlers() {
  if (!vkInstance) {
    throw new Error('ВК бот не инициализирован')
  }

  const { updates } = vkInstance

  // Команда /auth (работает каскадно по профилям для всех ролей)
  // Внутри setupVkHandlers() заменяем блок /auth
  updates.on('message_new', async (ctx, next) => {
    if (!ctx.text) {
      return next()
    }

    const [command, identifier, password] = ctx.text.split(' ')

    if (command === '/auth') {
      if (!identifier) {
        return ctx.send('⚠️ Формат: /auth [ID] [пароль]')
      }

      try {
        const user = await authService.findUser(identifier)
        if (!user) {
          return ctx.send('❌ Пользователь не найден.')
        }

        const isNewStudent = user.role === UserRole.STUDENT && !user.password
        if (isNewStudent && !password) {
          return ctx.send(
            'Для первого входа задайте пароль: /auth [ID] [пароль]'
          )
        }

        await authService.verifyAndSetPassword(
          user.id,
          password || '',
          isNewStudent
        )

        const bot = await prisma.bot.findFirst({
          where: { platform: BotPlatform.VK },
        })
        if (!bot) {
          throw new Error('Бот не найден')
        }

        await authService.registerBot(user.id, bot.id, ctx.peerId.toString())

        return ctx.send(
          `✅ Авторизован как ${user.firstName} ${user.lastName}`
        )
      } catch (error: any) {
        return ctx.send(`❌ ${error.message || 'Ошибка авторизации'}`)
      }
    }
    return next()
  })

  // Обработка обычных текстовых сообщений
  updates.on('message_new', async (ctx) => {
    // Пропускаем исходящие и любые команды, кроме /prep
    if (
      ctx.isOutbox ||
      (ctx.text?.startsWith('/') && !ctx.text?.startsWith('/prep'))
    ) {
      return
    }

    const vkPeerId = ctx.peerId.toString()
    const messageText = ctx.text?.trim() || ''

    try {
      // Находим запись в BotUser, подтягивая базового User
      const botUser = await prisma.botUser.findFirst({
        where: {
          externalId: vkPeerId,
          bot: { platform: BotPlatform.VK },
        },
        include: {
          bot: true,
          user: true,
        },
      })

      if (!botUser) {
        return ctx.send('Введите /auth [ваш_id] для начала работы.')
      }

      const user = botUser.user
      const isStudent = user.role === UserRole.STUDENT

      // ==========================================
      // ЛОГИКА ДЛЯ ПРЕПОДАВАТЕЛЕЙ / СОТРУДНИКОВ
      // ==========================================
      if (!isStudent) {
        return ctx.send(
          'ℹ️ Вы вошли как сотрудник. Отправка сообщений студентам выполняется через веб-панель StudLink. Бот используется для получения уведомлений.'
        )
      }

      // ==========================================
      // ЛОГИКА ДЛЯ СТУДЕНТА — ОПРЕДЕЛЯЕМ ПОЛУЧАТЕЛЯ
      // ==========================================
      let recipientId: string | null = null
      let responseConfirm = ''
      let finalMessageText = messageText

      // Вариант А: Студент пишет конкретному преподавателю через /prep [Фамилия] [Текст]
      if (messageText.startsWith('/prep')) {
        const parts = messageText.split(' ')
        const teacherLastName = parts[1] // Фамилия препода
        finalMessageText = parts.slice(2).join(' ') // Текст сообщения

        if (!teacherLastName || !finalMessageText) {
          return ctx.send(
            '⚠️ Формат команды: /prep [Фамилия_преподавателя] [Текст сообщения]'
          )
        }

        // Ищем преподавателя по фамилии
        const teacher = await prisma.user.findFirst({
          where: {
            role: UserRole.TEACHER,
            lastName: { equals: teacherLastName, mode: 'insensitive' }, // Игнорируем регистр
          },
        })

        if (!teacher) {
          return ctx.send(
            `❌ Преподаватель с фамилией "${teacherLastName}" не найден в системе.`
          )
        }

        recipientId = teacher.id
        responseConfirm = `👌 Ваше сообщение передано преподавателю: ${teacher.firstName} ${teacher.lastName}.`
      }
      // Вариант Б: Обычное сообщение летит в Деканат своего факультета
      else {
        // Получаем факультет студента через сложную цепочку связей
        const studentData = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            studentProfile: {
              include: {
                group: {
                  include: {
                    department: true,
                  },
                },
              },
            },
          },
        })

        const facultyId =
          studentData?.studentProfile?.group?.department?.facultyId

        // Ищем сотрудника деканата, привязанного к этому факультету
        const deaneryStaff = await prisma.user.findFirst({
          where: {
            role: UserRole.DEANERY,
            deaneryProfile: {
              facultyId: facultyId,
            },
          },
        })

        // Фолбек: если на факультете нет деканата, ищем любого АДМИНА
        const admin = !deaneryStaff
          ? await prisma.user.findFirst({ where: { role: UserRole.ADMIN } })
          : null

        recipientId = deaneryStaff?.id || admin?.id || null
        responseConfirm = deaneryStaff
          ? '👌 Сообщение отправлено в Деканат вашего факультета.'
          : '👌 Сообщение передано в администрацию.'
      }

      // Сохранение сообщения в БД по новой структуре (без targetType)
      const savedMsg = await prisma.message.create({
        data: {
          text: finalMessageText.trim(),
          senderType: SenderType.STUDENT,
          senderId: user.id, // Кто отправил (Студент)
          recipientId: recipientId, // Кому (Деканат или Преподаватель)
          externalId: ctx.id.toString(),
          botId: botUser.bot.id,
          platform: BotPlatform.VK,
        },
      })

      getIO().emit('new_message', {
        ...savedMsg,
        senderName: `${user.firstName} ${user.lastName}`,
      })
      await ctx.send(responseConfirm)
    } catch (error) {
      console.error('Ошибка при сохранении сообщения в ВК:', error)
      return ctx.send('Произошла ошибка при сохранении сообщения')
    }
  })
}
let restartAttempts = 0

const handleRestart = () => {
  restartAttempts++
  const delay = Math.min(30000, 5000 * restartAttempts) // Максимум 30 секунд ожидания

  console.log(
    `⏳ Перезапуск VK бота через ${delay / 1000} сек... (Попытка ${restartAttempts})`
  )

  setTimeout(async () => {
    try {
      // Сбрасываем инстанс, чтобы инициализировать заново
      vkInstance = null
      await startVkBot()
      restartAttempts = 0 // Сброс счетчика при успехе
    } catch (e) {
      handleRestart() // Если снова неудача — пробуем еще раз
    }
  }, delay)
}
export const startVkBot = async () => {
  try {
    if (!vkInstance) {
      await initializeVkBot()
    }

    console.log('🔄 Попытка запуска VK бота...')

    // 1. Сначала запускаем цикл, не дожидаясь его завершения (т.к. он бесконечный)
    // Мы используем .then() для подтверждения успешного старта
    const startPromise = vkInstance!.updates.start().catch((err) => {
      console.error('❌ Ошибка в цикле обновлений VK:', err)
      handleRestart()
    })

    // 2. Логируем, что старт прошел успешно (процесс пошел)
    console.log('✅ VK бот успешно запущен и слушает сообщения')

    return startPromise
  } catch (error) {
    console.error('⛔ Критическая ошибка при старте VK:', error)
    // Перезапуск через 5 секунд при фатальной ошибке
    setTimeout(startVkBot, 5000)
  }
}

// Универсальная функция отправки сообщения пользователю системы в ВК по его userId
export const sendMessageToVkUser = async (userId: string, message: string) => {
  if (!vkInstance) {
    throw new Error('ВК бот не инициализирован')
  }

  const chatId = await botService.getChatIdByUserId(userId, BotPlatform.VK)

  if (!chatId) {
    throw new Error('Пользователь не авторизован в боте')
  }

  try {
    await vkInstance.api.messages.send({
      peer_id: Number(chatId),
      message: message,
      random_id: Math.floor(Math.random() * 2147483647),
    })

    return { success: true, error: '' }
  } catch (error: any) {
    console.error(`[VK] Ошибка API при отправке:`, error.message || error)
    return { success: false, error: error.message || error }
  }
}

export const sendMessageToVkStudent = sendMessageToVkUser
