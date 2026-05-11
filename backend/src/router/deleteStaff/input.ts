import { z } from 'zod'

export const zDeleteStaffTrpcInput = z.object({
  id: z.string().uuid(),
})