import { z } from 'zod'

export const zSignUpTrpcInput = z.object({
  nick: z
    .string()
    .min(1)
    .regex(/^[a-zА-Яа-я0-9-]+$/, 'Псевдоним содержит только буквы, цифры и тире.'),
  password: z.string().min(1, 'Пароль должен быть не менее 8 символов'),
})
