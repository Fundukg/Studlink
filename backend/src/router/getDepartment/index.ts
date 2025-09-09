import { trpc } from '../../lib/trpc'

export const getDepartmentTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  const Departmen = await ctx.prisma.department.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
      faculty: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })
  return Departmen
})