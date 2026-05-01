import { z } from 'zod'

export const zDeleteGroupTrpcInput = z.object({
  id: z.string().uuid(),
})
