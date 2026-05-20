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
  // Теперь это массив строк. Для ALL он может быть пустым.
  targetIds: z.array(z.string()).default([]), 
  platform: z.enum(['TELEGRAM', 'VK', 'OK', 'ALL']),
})