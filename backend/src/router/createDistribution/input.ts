import { BotPlatform } from '@prisma/client'
import { z } from 'zod'

export const zCreateDistributionTrpcInput = z.object({
  text: z.string().min(1, 'Текст обязателен'),
  targetType: z.enum(["USER", "GROUP", "DEPARTMENT" , "FACULTY",  "COURSE" , "TEACHER" , "ALL"]),
  // targetType: z.nativeEnum(TargetType),
  // Теперь это массив строк. Для ALL он может быть пустым.
  targetIds: z.array(z.string()).default([]), 
  platform: z.nativeEnum(BotPlatform),
})