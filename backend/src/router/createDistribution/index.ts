import z from 'zod'
import { Dialogue } from '../../lib/dialogue'
import { trpc } from '../../lib/trpc'

export const createDistributionTrpcRoute = trpc.procedure
  .input(
    z.object({
      course: z.string().min(1).max(4),
      departament: z
        .string()
        .min(1)
        .regex(/^[a-zА-Яа-я0-9-]+$/, 'Directions contain only lowercase letters number and dashes')
        .max(10),
      directions: z
        .string()
        .min(1)
        .regex(/^[a-zА-Яа-я0-9-]+$/, 'Directions contain only lowercase letters number and dashes')
        .max(10),
      group: z
        .string()
        .min(1)
        .regex(/^[a-zА-Яа-я0-9-]+$/, 'Directions contain only lowercase letters number and dashes')
        .max(10),
      message: z.string().min(1, 'Message should be at least 10 characters long'),
    })
  )
  .mutation(({ input }) => {
    Dialogue.unshift(input)
    return true
  })
