import { trpc } from '../../lib/trpc'
import { isAdmin } from '../../utils/role'
import { zUpdateBotTrpcInput } from './input'

export const updateBotTrpcRoute = trpc.procedure
  .input(zUpdateBotTrpcInput)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.me) {
      throw Error('Unauthorized')
    }
    if (!isAdmin(ctx.me?.role)) {
      throw new Error('Доступ запрещен: недостаточно прав')
    }

    return await ctx.prisma.bot.update({
      where: { id: input.id },
      data: {
        name: input.name,
        platform: input.platform,
        settings: input.settings,
        token: input.token,
      },
    })
  })
