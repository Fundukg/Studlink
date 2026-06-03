import { UserRole } from '@prisma/client'
import z from 'zod'

export const zUpdateAdminInput = z.object({
  id: z.string().uuid(),
  nick: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  middleName: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
})
