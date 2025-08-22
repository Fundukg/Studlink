import z from 'zod'

export const zCreateStudentTrpcInput = z.object({
  student_id: z.string().min(5).max(10),
  name: z
    .string()
    .min(1)
    .regex(/^[a-zА-Яа-я -]+$/, 'Name contain only letters'),
  course: z.string().min(1, 'Course contain only number'),
  groupId: z
    .string()
    .min(1)
    .regex(/^[a-zА-Яа-я0-9-]+$/, 'Group contain only lowercase letters number and dashes')
    .max(10),
})
