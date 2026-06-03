import { BotPlatform } from '@prisma/client'
import { z } from 'zod'

export const zCreateDirectMessageTrpcInput = z.object({
  userId: z.string(),
  text: z.string(),
  platform: z.nativeEnum(BotPlatform),
})
