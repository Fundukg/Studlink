// backend/src/router/profile/changePassword.ts
import { TRPCError } from '@trpc/server'
import { trpc } from '../../lib/trpc'
import { isAuthenticated } from '../../middleware/auth'
import { getPasswordHash } from '../../utils/getPasswordHash'
import { zChangePasswordTrpcInput } from './input'

export const changePasswordTrpcRoute = trpc.procedure
  .use(isAuthenticated)
  .input(zChangePasswordTrpcInput)
  .mutation(async ({ input, ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.me!.id },
    })
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Пользователь не найден',
      })
    }

    await ctx.prisma.user.update({
      where: { id: ctx.me!.id },
      data: { password: getPasswordHash(input.password), firstLogin: true },
    })
    return { success: true }
  })
