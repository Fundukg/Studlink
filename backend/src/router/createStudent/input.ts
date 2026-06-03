import z from 'zod'

export const zCreateStudentTrpcInput = z.object({
  // Номер зачетки студента (от 5 до 10 символов)
  student_id: z
    .string()
    .min(5, 'Номер зачетной книжки слишком короткий')
    .max(10, 'Номер зачетной книжки слишком длинный'),

  // Фамилия (Обязательно)
  lastName: z
    .string()
    .min(1, 'Фамилия обязательна для заполнения')
    .regex(/^[А-Яа-яA-Za-z -]+$/, 'Фамилия должна содержать только буквы'),

  // Имя (Обязательно)
  firstName: z
    .string()
    .min(1, 'Имя обязательно для заполнения')
    .regex(/^[А-Яа-яA-Za-z -]+$/, 'Имя должно содержать только буквы'),

  // Отчество (Опционально)
  middleName: z
    .string()
    .regex(/^[А-Яа-яA-Za-z -]+$/, 'Отчество должно содержать только буквы')
    .optional()
    .or(z.literal('')), // Позволяет фронтенду передавать пустую строку

  // Номер курса перевели в число (Int), как требует новая схема Prisma
  // course: z
  //   .number({ required_error: 'Курс должен быть числом' })
  //   .int('Курс должен быть целым числом')
  //   .min(1, 'Минимальный курс — 1')
  //   .max(6, 'Максимальный курс — 6'),

  // ID группы остался строкой (UUID)
  groupId: z.string().min(1, 'ID группы не может быть пустым'),

  // Дополнительно: флаг старосты (пригодится на фронтенде при создании)
  isLeader: z.boolean().optional().default(false),
})

export type TCreateStudentTrpcInput = z.infer<typeof zCreateStudentTrpcInput>
