import z from 'zod'

export const zCreateGroupTrpcInput = z.object({
  name: z.string().min(2, 'Название обязательно'),
  departmentId: z.string().min(1, 'Название обязательно'),
})
