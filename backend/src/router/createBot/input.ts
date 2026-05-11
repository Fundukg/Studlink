import { BotPlatform } from '@prisma/client'
import { z } from 'zod'

export const zCreateBotTrpcInput = z.object({
  name: z.string().min(1, 'Имя бота обязательно'),
  platform: z.nativeEnum(BotPlatform),
  token: z.string().min(5, 'Токен слишком короткий'),
  settings: z.record(z.any()).optional(), // Для хранения Json
})