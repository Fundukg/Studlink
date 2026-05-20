import { RoleStaff } from '@prisma/client'
import { z } from 'zod'

export const zSignUpTrpcInput = z.object({
  nick: z
    .string()
    .min(1)
    .regex(
      /^[A-za-zА-Яа-я0-9-]+$/,
      'Псевдоним содержит только буквы, цифры и тире.'
    ),
  password: z.string().min(1, 'Пароль должен быть не менее 8 символов'),
  firstName: z
    .string()
    .min(1)
    .regex(/^[a-zА-Яа-я -]+$/, 'Имя может содержать только буквы'),
  lastName: z.string().min(1),
  middleName: z.string().optional(),
  role: z.nativeEnum(RoleStaff),
})
