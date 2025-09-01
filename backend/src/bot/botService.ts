// botService.ts
import { PrismaClient, BotPlatform } from '@prisma/client'

const prisma = new PrismaClient()

export const botService = {
  // Получение токена бота по платформе
  getBotToken: async (platform: BotPlatform): Promise<string> => {
    const bot = await prisma.bot.findUnique({
      where: { platform },
      select: { token: true }
    })

    if (!bot) {
      throw new Error(`Бот для платформы ${platform} не найден`)
    }

    return bot.token
  },

  // Получение информации о боте
  getBotInfo: async (platform: BotPlatform) => {
    const bot = await prisma.bot.findUnique({
      where: { platform },
      include: {
        users: {
          include: {
            student: true
          }
        }
      }
    })

    if (!bot) {
      throw new Error(`Бот для платформы ${platform} не найден`)
    }

    return bot
  },

  // Регистрация пользователя бота
  registerBotUser: async (studentId: string, platform: BotPlatform, externalId: string) => {
    const bot = await prisma.bot.findUnique({
      where: { platform }
    })

    if (!bot) {
      throw new Error(`Бот для платформы ${platform} не найден`)
    }

    const botUser = await prisma.botUser.upsert({
      where: {
        studentId_botId: {
          studentId,
          botId: bot.id
        }
      },
      update: {
        externalId,
        isActive: true
      },
      create: {
        studentId,
        botId: bot.id,
        externalId,
        isActive: true
      }
    })

    return botUser
  },

  // Получение chat_id по student_id
  getChatIdByStudentId: async (studentId: string, platform: BotPlatform): Promise<string | null> => {
    const bot = await prisma.bot.findUnique({
      where: { platform }
    })

    if (!bot) {
      return null
    }

    const botUser = await prisma.botUser.findFirst({
      where: {
        studentId,
        botId: bot.id,
        isActive: true
      },
      select: {
        externalId: true
      }
    })

    return botUser?.externalId || null
  }
}