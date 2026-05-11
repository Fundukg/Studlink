import { z } from 'zod'

export const zDeleteDepartmentTrpcInput = z.object({
  id: z.string().uuid(),
})