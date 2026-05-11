import { RoleStaff } from '@prisma/client' // Импорт enum из Prisma
import { z } from 'zod'

export const zStaffUpdateTrpcInput = z.object({
  id: z.string().uuid(),
  nick: z.string().min(3).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  middleName: z.string().optional(),
  role: z.nativeEnum(RoleStaff).optional(),
})
