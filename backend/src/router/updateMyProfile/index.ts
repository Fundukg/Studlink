// backend/src/router/profile/updateMyProfile.ts
import { TRPCError } from '@trpc/server'
import { trpc } from '../../lib/trpc'
import { isAuthenticated } from '../../middleware/auth'
import { zUpdateMyProfileInput } from './input'

export const updateMyProfileTrpcRoute = trpc.procedure
  .use(isAuthenticated)
  .input(zUpdateMyProfileInput)
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.me!.id

    // Проверяем уникальность полей, если они переданы и не null
    if (input.nick !== undefined && input.nick !== null) {
      const existing = await ctx.prisma.user.findFirst({
        where: { nick: input.nick, id: { not: userId } },
      })
      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Пользователь с таким ником уже существует',
        })
      }
    }
    if (input.email !== undefined && input.email !== null) {
      const existing = await ctx.prisma.user.findFirst({
        where: { email: input.email, id: { not: userId } },
      })
      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Пользователь с таким email уже существует',
        })
      }
    }
    if (input.phone !== undefined && input.phone !== null) {
      const existing = await ctx.prisma.user.findFirst({
        where: { phone: input.phone, id: { not: userId } },
      })
      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Пользователь с таким телефоном уже существует',
        })
      }
    }

    // Обновляем пользователя
    await ctx.prisma.user.update({
      where: { id: userId },
      data: input,
    })

    return { success: true }
  })
