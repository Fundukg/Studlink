import { BotPlatform } from '@prisma/client'
import { z } from 'zod'

export const zCreateDirectMessageTrpcInput = z.object({
  studentId: z.string(),
  text: z.string(),
  platform: z.nativeEnum(BotPlatform),
})
