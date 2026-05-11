import { trpc } from '../../lib/trpc'

export const getBotsTrpcRoute = trpc.procedure
  .query(async ({ ctx }) => {
    if (!ctx.me) {throw Error('Unauthorized')}
    
    return await ctx.prisma.bot.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { users: true, messages: true } }
      }
    })
  })