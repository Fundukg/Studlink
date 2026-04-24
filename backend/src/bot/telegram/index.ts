// index.ts
import 'dotenv/config'
import { BotPlatform } from '@prisma/client'
import { Telegraf } from 'telegraf'
import { prisma } from '../../lib/prisma'
import { botService } from '../botService'
import type { BotContext } from './types'

let botInstance: Telegraf<BotContext> | null = null

// Функция инициализации бота
export const initializeBot = async (): Promise<void> => {
  try {
    // Получаем токен бота из базы данных
    await botService.syncBotsWithEnv()
    const token = await botService.getBotToken(BotPlatform.TELEGRAM)

    // Создаем экземпляр бота
    botInstance = new Telegraf<BotContext>(token)

    // Настраиваем обработчики
    setupBotHandlers()

    // console.log('Бот инициализирован с токеном из базы данных')
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
    await ctx.reply('Добро пожаловать! Для идентификации введите ваш student_id в формате: /auth YOUR_STUDENT_ID')
  })

  // Команда для идентификации
  bot.command('auth', async (ctx) => {
    const studentId = ctx.message.text.split(' ')[1]

    if (!studentId) {
      await ctx.reply('Пожалуйста, укажите ваш student_id после команда /auth')
      return
    }

    try {
      const student = await prisma.student.findUnique({
        where: { student_id: studentId },
      })

      if (!student) {
        await ctx.reply('Студент с таким student_id не найден')
        return
      }

      // Регистрируем пользователя бота
      await botService.registerBotUser(student.id, BotPlatform.TELEGRAM, ctx.from.id.toString())

      await ctx.reply(`Вы успешно идентифицированы как ${student.name}`)
    } catch (error) {
      console.error('Ошибка при идентификации:', error)
      await ctx.reply('Произошла ошибка при идентификации')
    }
  })

  // Обработчик текстовых сообщений от студентов
  bot.on('text', async (ctx) => {
    // Пропускаем команды
    if (ctx.message.text.startsWith('/')) {
      return
    }

    const telegramChatId = ctx.from.id.toString()

    try {
      // Находим запись в BotUser по externalId (telegramChatId)
      const botUser = await prisma.botUser.findFirst({
        where: {
          externalId: telegramChatId,
          bot: {
            platform: BotPlatform.TELEGRAM,
          },
        },
        include: {
          student: true,
          bot: true,
        },
      })

      if (!botUser) {
        await ctx.reply('Сначала выполните команду /auth для идентификации')
        return
      }

      // Сохраняем сообщение в базу
      await prisma.message.create({
        data: {
          text: ctx.message.text,
          senderType: 'STUDENT',
          studentId: botUser.student.id,
          targetType: 'STAFF',
          externalId: ctx.message.message_id.toString(),
          botId: botUser.bot.id,
        },
      })

      // Отправляем уведомление администраторам
      // eslint-disable-next-line node/no-process-env
      const adminChatId = process.env.ADMIN_CHAT_ID
      if (adminChatId) {
        await bot.telegram.sendMessage(
          adminChatId,
          `Новое сообщение от студента ${botUser.student.name} (${botUser.student.student_id}):\n${ctx.message.text}`
        )
      }

      await ctx.reply('Ваше сообщение сохранено и будет рассмотрено администратором.')
    } catch (error) {
      console.error('Ошибка при сохранении сообщения:', error)
      await ctx.reply('Произошла ошибка при сохранении сообщения')
    }
  })

  // Добавьте другие обработчики здесь...
}

// Функция для получения экземпляра бота
export const getBot = (): Telegraf<BotContext> => {
  if (!botInstance) {
    throw new Error('Бот не инициализирован')
  }
  return botInstance
}

// Функция отправки сообщения студенту
export const sendMessageToStudent = async (studentId: string, message: string) => {
  const bot = getBot()

  try {
    // Получаем chat_id из базы данных
    const chatId = await botService.getChatIdByStudentId(studentId, BotPlatform.TELEGRAM)

    if (!chatId) {
      throw new Error('Студент не найден или не авторизован в боте')
    }

    // Отправляем сообщение
    await bot.telegram.sendMessage(chatId, message)
    return true
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error)
    throw error
  }
}

// Функция запуска бота
export const startBot = async () => {
  if (!botInstance) {
    await initializeBot()
  }

  const bot = getBot()
  bot.launch()

  // console.log('Telegram бот запущен')

  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}
