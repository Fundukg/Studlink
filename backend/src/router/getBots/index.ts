import { trpc } from '../../lib/trpc'
import { isAdmin } from '../../utils/role'

export const getBotsTrpcRoute = trpc.procedure
  .query(async ({ ctx }) => {
    if (!ctx.me) {throw Error('Unauthorized')}
    if (!isAdmin(ctx.me?.role)) {
          throw new Error('Доступ запрещен: недостаточно прав')
        }
    return await ctx.prisma.bot.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { users: true, messages: true } }
      }
    })
  })