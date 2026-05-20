import { trpc } from '../../lib/trpc'
import { isAdmin, isDeanery } from '../../utils/role'

export const getFacultyTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  if (!ctx.me) {
    throw Error('Unauthorized')
  }
  if (!isAdmin(ctx.me?.role)  && !isDeanery(ctx.me?.role)) {
        throw new Error('Доступ запрещен: недостаточно прав')
      }
  const Faculty = await ctx.prisma.faculty.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
      // Добавляем подсчет связанных сущностей
      _count: {
        select: {
          departments: true, // Убедись, что в схеме Prisma связь называется именно так
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return { Faculty }
})
