import { trpc } from '../../lib/trpc'

export const getFacultyTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  const Faculty = await ctx.prisma.faculty.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
    },

    orderBy: {
      name: 'asc',
    },
  })
  return { Faculty }
})
