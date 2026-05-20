import { trpc } from '../../lib/trpc'
import { isAdmin } from '../../utils/role'
import { zCreateBotTrpcInput } from './input'

export const createBotTrpcRoute = trpc.procedure
  .input(zCreateBotTrpcInput)
  .mutation(async ({ input, ctx }) => {
    if (!isAdmin(ctx.me?.role)) {
      throw new Error('Доступ запрещен: недостаточно прав')
    }

    const exists = await ctx.prisma.bot.findUnique({
      where: { platform: input.platform },
    })
    if (exists) {
      throw Error(`Бот для платформы ${input.platform} уже существует`)
    }

    return await ctx.prisma.bot.create({
      data: {
        ...input,
        settings: input.settings || {},
      },
    })
  })
