// index.ts
import 'dotenv/config'
import { BotPlatform, SenderType, UserRole } from '@prisma/client'
import { Telegraf } from 'telegraf'
import { prisma } from '../../lib/prisma'
import { authService } from '../authService'
import { botService } from '../botService'
import type { BotContext } from './types'

let botInstance: Telegraf<BotContext> | null = null

// Функция инициализации бота
export const initializeBot = async (): Promise<void> => {
  try {
    await botService.syncBotsWithEnv()
    const token = await botService.getBotToken(BotPlatform.TELEGRAM)

    botInstance = new Telegraf<BotContext>(token)

    setupBotHandlers()
  } catch (error) {
    console.error('Ошибка инициализации бота:', error)
    throw error
  }
}

// Функция настройки обработчиков
function setupBotHandlers() {
  if (!botInstance) {
    throw new Error('Бот не инициализирован')
  }

  const bot = botInstance

  // Команда для начала работы
  bot.start(async (ctx) => {
    await ctx.reply(
      'Добро пожаловать! Для начала работы введите: /auth [ID] [пароль]'
    )
  })

  bot.command('auth', async (ctx) => {
    const parts = ctx.message.text.split(' ')
    const identifier = parts[1] // ID зачетки или nick
    const password = parts[2] // Пароль

    if (!identifier) {
      await ctx.reply('⚠️ Формат: /auth [ID] [пароль]')
      return
    }

    // 1. Поиск пользователя
    const user = await authService.findUser(identifier)
    if (!user) {
      await ctx.reply('❌ Пользователь не найден.')
      return
    }

    // 2. Логика пароля
    try {
      const isNewStudent = user.role === UserRole.STUDENT && !user.password

      // Если студент новый, а пароль не прислали
      if (isNewStudent && !password) {
        await ctx.reply(
          'Для первого входа задайте пароль: /auth [ID] [пароль]'
        )
        return
      }

      // Проверка/установка пароля
      await authService.verifyAndSetPassword(
        user.id,
        password || '',
        isNewStudent
      )

      // 3. Привязка бота
      const botEntity = await prisma.bot.findFirst({
        where: { platform: BotPlatform.TELEGRAM },
      })
      if (!botEntity) {
        throw new Error('Бот не найден в БД')
      }

      await authService.registerBot(
        user.id,
        botEntity.id,
        ctx.from.id.toString()
      )

      await ctx.reply(
        `✅ Авторизован как ${user.firstName} ${user.lastName}. Приветствуем!`
      )
    } catch (error: any) {
      await ctx.reply(`❌ ${error.message || 'Ошибка авторизации'}`)
    }
  })

  // Обработчик текстовых сообщений
  bot.on('text', async (ctx) => {
    // Пропускаем команды (команда /prep обрабатывается ниже динамически)
    if (
      ctx.message.text.startsWith('/') &&
      !ctx.message.text.startsWith('/prep')
    ) {
      return
    }

    const telegramChatId = ctx.from.id.toString()
    const messageText = ctx.message.text.trim()

    try {
      // Находим запись в BotUser, подтягивая базовую модель User
      const botUser = await prisma.botUser.findFirst({
        where: {
          externalId: telegramChatId,
          bot: { platform: BotPlatform.TELEGRAM },
        },
        include: {
          bot: true,
          user: true,
        },
      })

      if (!botUser) {
        await ctx.reply('Введите /auth [ваш_id] для начала работы.')
        return
      }

      const user = botUser.user
      const isStudent = user.role === UserRole.STUDENT

      // ==========================================
      // ЛОГИКА ДЛЯ ПРЕПОДАВАТЕЛЕЙ / СОТРУДНИКОВ
      // ==========================================
      if (!isStudent) {
        await ctx.reply(
          'ℹ️ Вы вошли как сотрудник. Отправка сообщений студентам выполняется через веб-панель StudLink. Бот используется для получения уведомлений.'
        )
        return
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
        const teacherLastName = parts[1] // Фамилия преподавателя
        finalMessageText = parts.slice(2).join(' ') // Чистый текст сообщения

        if (!teacherLastName || !finalMessageText) {
          await ctx.reply(
            '⚠️ Формат команды: /prep [Фамилия_преподавателя] [Текст сообщения]'
          )
          return
        }

        // Ищем преподавателя по фамилии
        const teacher = await prisma.user.findFirst({
          where: {
            role: UserRole.TEACHER,
            lastName: { equals: teacherLastName, mode: 'insensitive' },
          },
        })

        if (!teacher) {
          await ctx.reply(
            `❌ Преподаватель с фамилией "${teacherLastName}" не найден в системе.`
          )
          return
        }

        recipientId = teacher.id
        responseConfirm = `👌 Ваше сообщение передано преподавателю: ${teacher.firstName} ${teacher.lastName}.`
      }
      // Вариант Б: Обычное сообщение без спецкоманд летит напрямую в Деканат
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
          : '👌 Сообщение отправлено в администрацию.'
      }

      // Сохраняем сообщение Студента в базу данных
      await prisma.message.create({
        data: {
          text: finalMessageText.trim(),
          senderType: SenderType.STUDENT,
          senderId: user.id, // Кто отправил (Студент)
          recipientId: recipientId, // Кому персонально (Деканат или Преподаватель)
          externalId: ctx.message.message_id.toString(),
          botId: botUser.bot.id,
          platform: BotPlatform.TELEGRAM,
        },
      })

      // Подтверждаем отправку студенту
      await ctx.reply(responseConfirm)
    } catch (error) {
      console.error('Ошибка при сохранении сообщения в TG:', error)
      await ctx.reply('Произошла ошибка при обработке сообщения.')
    }
  })
}

// Функция для получения экземпляра бота
export const getBot = (): Telegraf<BotContext> => {
  if (!botInstance) {
    throw new Error('Бот не инициализирован')
  }
  return botInstance
}

// Универсальная функция отправки сообщения по общему userId
export const sendMessageToUser = async (userId: string, message: string) => {
  const bot = getBot()

  const chatId = await botService.getChatIdByUserId(
    userId,
    BotPlatform.TELEGRAM
  )

  if (!chatId) {
    throw new Error('Пользователь не авторизован в боте')
  }

  try {
    await bot.telegram.sendMessage(chatId, message)
    return { success: true, error: '' }
  } catch (error: any) {
    console.error('Ошибка отправки сообщения:', error)
    return { success: false, error: error }
  }
}

export const sendMessageToStudent = sendMessageToUser

// Функция запуска бота
let isStarting = false

export const startBot = async () => {
  if (isStarting) {
    return
  }
  isStarting = true

  try {
    if (!botInstance) {
      await initializeBot()
    }

    console.log('🔄 Запуск Telegram бота...')

    // Запускаем launch, но не ждем его завершения (так как это бесконечный процесс)
    // Мы просто запускаем его, а результат (ошибки) обрабатываем через .catch
    const launchPromise = botInstance!.launch().catch((err) => {
      console.error('❌ Ошибка в процессе работы Telegram бота:', err)
      handleRestart()
    })

    // Этот лог сработает сразу после того, как бот начал попытку подключения
    console.log('✅ Telegram бот успешно запущен и слушает сообщения')

    return launchPromise
  } catch (error) {
    console.error('⛔ Критическая ошибка при инициализации TG:', error)
    handleRestart()
  } finally {
    isStarting = false
  }
}

// Логика безопасного перезапуска
const handleRestart = () => {
  const delay = 10000 // 10 секунд перед повторной попыткой
  console.log(
    `⏳ Повторная попытка запуска TG бота через ${delay / 1000} сек...`
  )

  setTimeout(async () => {
    botInstance = null // Очищаем инстанс
    await startBot()
  }, delay)
}
