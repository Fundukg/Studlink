import { trpc } from '../../lib/trpc'

export const getGroupTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  const Group = await ctx.prisma.group.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
  return Group
})