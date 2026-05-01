import { z } from 'zod'

export const zUpdateStudentTrpcInput = z.object({
  id: z.string().uuid(),
  student_id: z.string().min(5).max(10),
  name: z
    .string()
    .min(1)
    .regex(/^[a-zА-Яа-я -]+$/, 'Имя может содержать только буквы'),
  course: z.string().min(1, 'Укажите курс'),
  groupId: z.string().uuid('Выберите корректную группу'),
})
