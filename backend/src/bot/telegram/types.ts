import { Context } from 'telegraf'

export type BotContext = {
  // Здесь можно добавить кастомные свойства контекста
  userData?: {
    studentId: string
    name: string
  }
  session?: {
    replyToDistribution?: string
  }
} & Context