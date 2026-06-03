// backend/src/router/student/input.ts
import { z } from 'zod'

export const zUpdateStudentTrpcInput = z.object({
  id: z.string().uuid(), // ID пользователя

  // Учебные данные
  student_id: z.string().min(5).max(10, 'Зачетка от 5 до 10 символов'),
  // course: z.number().min(1).max(6, 'Курс от 1 до 6'), // В БД теперь обычно число
  groupId: z.string().uuid('Выберите корректную группу'),

  // Данные пользователя
  firstName: z
    .string()
    .min(1, 'Имя обязательно')
    .regex(/^[a-zA-ZА-Яа-я -]+$/, 'Имя может содержать только буквы'),
  lastName: z
    .string()
    .min(1, 'Фамилия обязательна')
    .regex(/^[a-zA-ZА-Яа-я -]+$/, 'Фамилия может содержать только буквы'),
  middleName: z.string().optional(),
})
