/* eslint-disable node/no-process-env */
// botService.ts
import { BotPlatform } from '@prisma/client'
import { prisma } from '../lib/prisma'

type BotConfig = {
  platform: BotPlatform
  token: string | undefined
  enabled: boolean
  name: string
}

export const botService = {
  syncBotsWithEnv: async () => {
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
      if (!config.token || config.token.includes('your_')) {
        continue
      }

      await prisma.bot.upsert({
        where: { platform: config.platform },
        update: {
          token: config.token,
          isActive: config.enabled,
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

  // Получение информации о боте и его пользователях (с их профилями)
  getBotInfo: async (platform: BotPlatform) => {
    const bot = await prisma.bot.findUnique({
      where: { platform },
      include: {
        users: {
          include: {
            user: {
              include: {
                studentProfile: true,
                teacherProfile: true,
              },
            },
          },
        },
      },
    })

    if (!bot) {
      throw new Error(`Бот для платформы ${platform} не найден`)
    }

    return bot
  },

  // Регистрация/привязка пользователя бота (работает и для студентов, и для преподов)
  registerBotUser: async (
    userId: string,
    platform: BotPlatform,
    externalId: string
  ) => {
    const bot = await prisma.bot.findUnique({
      where: { platform },
    })

    if (!bot) {
      throw new Error(`Бот для платформы ${platform} не найден`)
    }

    const botUser = await prisma.botUser.upsert({
      where: {
        userId_botId: {
          userId,
          botId: bot.id,
        },
      },
      update: {
        externalId,
        isActive: true,
      },
      create: {
        userId,
        botId: bot.id,
        externalId,
        isActive: true,
      },
    })

    return botUser
  },

  // Получение externalId (chat_id) по id пользователя системы
  getChatIdByUserId: async (
    userId: string,
    platform: BotPlatform
  ): Promise<string | null> => {
    const bot = await prisma.bot.findUnique({
      where: { platform },
    })

    if (!bot) {
      return null
    }
    console.log(userId)
    const botUser = await prisma.botUser.findFirst({
      where: {
        userId,
        botId: bot.id,
        isActive: true,
      },
      select: {
        externalId: true,
      },
    })
    console.log('botUser',userId, botUser)
    return botUser?.externalId || null
  },
}
