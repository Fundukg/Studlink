import { PrismaClient } from '@prisma/client'
import { Telegraf } from 'telegraf'
import type { BotContext } from './types'

const prisma = new PrismaClient()
// eslint-disable-next-line node/no-process-env
const bot = new Telegraf<BotContext>(process.env.TELEGRAM_BOT_TOKEN!)

// Команда для начала работы
bot.start(async (ctx) => {
  await ctx.reply('Добро пожаловать! Для идентификации введите ваш student_id в формате: /auth YOUR_STUDENT_ID')
})

// Команда для идентификации
bot.command('auth', async (ctx) => {
  const studentId = ctx.message.text.split(' ')[1]

  if (!studentId) {
    await ctx.reply('Пожалуйста, укажите ваш student_id после команды /auth')
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

    await prisma.student.update({
      where: { student_id: studentId },
      data: { telegramChatId: ctx.from.id.toString() },
    })

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
    // Находим студента по telegramChatId
    const student = await prisma.student.findFirst({
      where: { telegramChatId },
    })

    if (!student) {
      await ctx.reply('Сначала выполните команду /auth для идентификации')
      return
    }

    // Сохраняем сообщение в базу
   await prisma.message.create({ // const message = 
      data: {
        text: ctx.message.text,
        senderType: 'STUDENT',
        studentId: student.id,
        targetType: 'STAFF', // адресовано сотрудникам
        externalId: ctx.message.message_id.toString(),
      },
    })

    // Отправляем уведомление администраторам
    // eslint-disable-next-line node/no-process-env
    const adminChatId = process.env.ADMIN_CHAT_ID
    if (adminChatId) {
      await bot.telegram.sendMessage(
        adminChatId,
        `Новое сообщение от студента ${student.name} (${student.student_id}):\n${ctx.message.text}`
      )
    }

    await ctx.reply('Ваше сообщение сохранено и будет рассмотрено администратором.')
  } catch (error) {
    console.error('Ошибка при сохранении сообщения:', error)
    await ctx.reply('Произошла ошибка при сохранении сообщения')
  }
})

// Обработчик медиа-сообщений (фото, документы, видео)
bot.on(['photo', 'document', 'video'], async (ctx) => {
  const telegramChatId = ctx.from.id.toString()

  try {
    const student = await prisma.student.findFirst({
      where: { telegramChatId },
    })

    if (!student) {
      await ctx.reply('Сначала выполните команду /auth для идентификации')
      return
    }

    let mediaText = ''
    if ('photo' in ctx.message) {
      mediaText = '[Фото]'
    } else if ('document' in ctx.message) {
      mediaText = `[Документ: ${ctx.message.document.file_name}]`
    } else if ('video' in ctx.message) {
      mediaText = '[Видео]'
    }

    // Сохраняем сообщение в базу
    await prisma.message.create({ //const message = 
      data: {
        text: mediaText,
        senderType: 'STUDENT',
        studentId: student.id,
        targetType: 'STAFF',
        externalId: ctx.message.message_id.toString(),
      },
    })

    // Отправляем уведомление администраторам
    // eslint-disable-next-line node/no-process-env
    const adminChatId = process.env.ADMIN_CHAT_ID
    if (adminChatId) {
      await bot.telegram.sendMessage(
        adminChatId,
        `Новое медиа-сообщение от студента ${student.name} (${student.student_id}): ${mediaText}`
      )
    }

    await ctx.reply('Ваше медиа-сообщение сохранено и будет рассмотрено администратором.')
  } catch (error) {
    console.error('Ошибка при сохранении медиа-сообщения:', error)
    await ctx.reply('Произошла ошибка при сохранении медиа-сообщения')
  }
})

// Экспорт функций для использования в других частях приложения
export const sendMessageToStudent = async (studentId: string, message: string) => {
  try {
    // Находим студента и его chat_id
    const student = await prisma.student.findUnique({
      where: { student_id: studentId },
    })

    if (!student || !student.telegramChatId) {
      throw new Error('Студент не найден или не авторизован в боте')
    }

    // Отправляем сообщение
    await bot.telegram.sendMessage(student.telegramChatId, message)
    return true
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error)
    throw error
  }
}

export const startBot = () => {
  bot.launch()
  //   console.log('Telegram бот запущен');

  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

export default bot
