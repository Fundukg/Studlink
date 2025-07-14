import z from 'zod'

export const zCreateDistributionTrpcInput = z.object({
  course: z.string().min(1).max(4),
  department: z
    .string()
    .min(1)
    .regex(/^[a-zА-Яа-я0-9-]+$/, 'Directions contain only lowercase letters number and dashes')
    .max(10),
  directions: z
    .string()
    .min(1)
    .regex(/^[a-zА-Яа-я0-9-]+$/, 'Directions contain only lowercase letters number and dashes')
    .max(10),
  group: z
    .string()
    .min(1)
    .regex(/^[a-zА-Яа-я0-9-]+$/, 'Directions contain only lowercase letters number and dashes')
    .max(10),
  message: z.string().min(1, 'Message should be at least 10 characters long'),
})
