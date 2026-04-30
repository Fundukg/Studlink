import { z } from 'zod'

export const zDeleteFacultyTrpcInput = z.object({
  id: z.string().uuid(),
})