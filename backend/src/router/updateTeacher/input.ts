import { UserRole } from '@prisma/client'
import z from 'zod'

export const zUpdateTeacherInput = z.object({
  id: z.string().uuid(),
  nick: z.string().min(3).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  middleName: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  groupIds: z.array(z.string().uuid()).optional(),
})
