import z from 'zod'

export const zUpdateMyProfileInput = z.object({
  nick: z.string().min(3).max(50).nullable().optional(),
  lastName: z.string().min(1).max(100).optional(),
  firstName: z.string().min(1).max(100).optional(),
  middleName: z.string().max(100).nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().min(5).max(20).nullable().optional(),
})
