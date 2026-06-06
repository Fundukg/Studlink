// backend/src/router/staff/createDeanery/index.ts
import { UserRole } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { trpc } from '../../lib/trpc'
import { hasPermission } from '../../middleware/auth'
import { getPasswordHash } from '../../utils/getPasswordHash'
import { zCreateDeaneryInput } from './input'

export const createDeaneryTrpcRoute = trpc.procedure
  .use(hasPermission('manage:staff'))
  .input(zCreateDeaneryInput)
  .mutation(async ({ input, ctx }) => {
    const existingUser = await ctx.prisma.user.findUnique({
      where: { nick: input.nick },
    })
    if (existingUser) {
      throw new TRPCError({ code: 'CONFLICT', message: 'Ник занят' })
    }

    return await ctx.prisma.$transaction(async (tx) => {
      // Добавляем проверку, чтобы TypeScript понял, что facultyId существует
      if (!input.facultyId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Faculty ID обязателен для сотрудника деканата',
        })
      }

      const user = await tx.user.create({
        data: {
          nick: input.nick,
          password: getPasswordHash(input.password),
          firstName: input.firstName,
          lastName: input.lastName,
          middleName: input.middleName,
          role: UserRole.DEANERY,
          firstLogin: true,
          deaneryProfile: {
            create: {
              facultyId: input.facultyId, // Теперь TS знает, что это string
            },
          },
        },
      })
      return { userId: user.id }
    })
  })
