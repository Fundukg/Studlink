import { trpc } from '../../lib/trpc'
import { isAdmin, isDeanery } from '../../utils/role'

export const getDepartmentTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  if (!ctx.me) {
    throw Error('Unauthorized')
  }
  if (!isAdmin(ctx.me?.role)  && !isDeanery(ctx.me?.role)) {
        throw new Error('Доступ запрещен: недостаточно прав')
      }
  const Department = await ctx.prisma.department.findMany({
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
  return { Department }
})
