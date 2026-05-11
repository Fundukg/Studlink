import { trpc } from '../../lib/trpc'
import { isAdmin } from '../../utils/role'
import { zUpdateBotTrpcInput } from './input'

export const updateBotTrpcRoute = trpc.procedure
  .input(zUpdateBotTrpcInput)
  .mutation(async ({ input, ctx }) => {
    isAdmin(ctx.me?.role)

    return await ctx.prisma.bot.update({
      where: { id: input.id },
      data: {
        name: input.name,
        platform: input.platform,
        settings: input.settings,
        token: input.token
      }
    })
  })