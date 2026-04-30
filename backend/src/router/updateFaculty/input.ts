import { z } from 'zod'

export const zUpdateFacultyTrpcInput = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Название обязательно'),
})