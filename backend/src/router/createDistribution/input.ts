import { z } from 'zod'

export const zCreateDistributionTrpcInput = z.object({
    text: z.string().min(1, 'Текст обязателен'),
    targetType: z.enum([
      'STUDENT',
      'GROUP',
      'DEPARTMENT',
      'FACULTY',
      'COURSE', // Добавлено
      'ALL',
    ]),
    targetId: z.string().optional(),// Добавлено поле для курса
  })
  // .superRefine((data, ctx) => {
  //   // Для всех типов, кроме ALL и COURSE, targetId обязателен
  //   if (data.targetType !== 'ALL' && data.targetType !== 'COURSE' && !data.targetId) {
  //     ctx.addIssue({
  //       code: z.ZodIssueCode.custom,
  //       message: `Для типа '${data.targetType}' обязательно указать targetId`,
  //     })
  //   }

  //   // Для типа COURSE course обязателен
  //   if (data.targetType === 'COURSE' && data.course === undefined) {
  //     ctx.addIssue({
  //       code: z.ZodIssueCode.custom,
  //       message: `Для типа 'COURSE' обязательно указать курс`,
  //     })
  //   }
  // })
