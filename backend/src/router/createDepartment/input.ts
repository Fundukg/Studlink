import z from 'zod'

export const zCreateDepartmentTrpcInput = z.object({
  name: z.string().min(1, 'Название обязательно'),
  facultyId: z.string().min(1, 'Название обязательно'),
})
