// backend/src/router/staff/input.ts
import { UserRole } from '@prisma/client'
import { z } from 'zod'

export const zDeaneryUpdateTrpcInput = z.object({
  id: z.string().uuid(),
  nick: z.string().min(3).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  middleName: z.string().optional(),

  // Используем UserRole вместо старого RoleStaff
  role: z.nativeEnum(UserRole).optional(),

  // Добавляем facultId для возможности привязки декана к факультету
  facultyId: z.string().uuid().optional(),
})
