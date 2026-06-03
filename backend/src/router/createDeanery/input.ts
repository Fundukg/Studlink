// backend/src/router/auth/input.ts
import { UserRole } from '@prisma/client'
import { z } from 'zod'

export const zCreateDeaneryInput = z.object({
  nick: z
    .string()
    .min(3, 'Псевдоним должен быть не менее 3 символов')
    .regex(
      /^[A-Za-zА-Яа-я0-9-]+$/,
      'Псевдоним содержит только буквы, цифры и тире.'
    ),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
  firstName: z
    .string()
    .min(1)
    .regex(/^[a-zA-ZА-Яа-я -]+$/, 'Имя может содержать только буквы'),
  lastName: z.string().min(1, 'Фамилия обязательна'),
  middleName: z.string().optional(),
  
  // Обновлено на UserRole
  role: z.nativeEnum(UserRole),
  
  // Добавлено поле для деканата
  facultyId: z.string().uuid('Некорректный ID факультета').optional(),
})