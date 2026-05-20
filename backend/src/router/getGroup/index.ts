import { trpc } from '../../lib/trpc'
import { isAdmin, isDeanery } from '../../utils/role'

export const getGroupTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  if (!ctx.me) {
    throw Error('Unauthorized')
  }
  if (!isAdmin(ctx.me?.role)  && !isDeanery(ctx.me?.role)) {
        throw new Error('Доступ запрещен: недостаточно прав')
      }
  const Group = await ctx.prisma.group.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
      department: {
        select: {
          id: true,
          name: true,
          faculty: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      // Добавляем подсчет связанных записей
      _count: {
        select: {
          students: true, // Убедись, что поле в схеме Prisma называется 'students'
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })
  
  return { Group }
})