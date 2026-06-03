import z from 'zod'

export const zChangePasswordTrpcInput = z
  .object({
    currentPassword: z.string().min(1),
    password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
    confirmPassword: z.string(),
  })
  .refine((data) =>
    data.password !== data.currentPassword
      ? {
          message: 'Новый пароль должен отличаться от текущего',
          path: ['password'],
        }
      : data.password === data.currentPassword
        ? {
            message: 'Пароли не совпадают',
            path: ['confirmPassword'], // Ошибка привяжется к полю confirmPassword
          }
        : true
  )
