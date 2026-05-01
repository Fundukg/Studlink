import { z } from 'zod'

export const zUpdateGroupTrpcInput = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Название обязательно'),
  departmentId: z.string().uuid(),
})
