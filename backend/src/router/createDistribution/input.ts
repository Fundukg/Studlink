import { z } from 'zod'

export const zCreateDistributionTrpcInput = z.object({
  text: z.string().min(1, 'Текст обязателен'),
  targetType: z.enum([
    'STUDENT',
    'GROUP',
    'DEPARTMENT',
    'FACULTY',
    'COURSE',
    'ALL',
  ]),
  targetId: z.string().optional(),
  platform: z.enum(['TELEGRAM', 'VK', 'OK', 'ALL']),
})
