import { trpc } from '../../lib/trpc'
import { isAdmin, isDeanery } from '../../utils/role'
import { zDeleteGroupTrpcInput } from './input'

export const getGroupDeleteStatsTrpcRoute = trpc.procedure
  .input(zDeleteGroupTrpcInput)
  .query(async ({ input, ctx }) => {
    if (!ctx.me) {
      throw Error('Unauthorized')
    }
    if (!isAdmin(ctx.me?.role)  && !isDeanery(ctx.me?.role)) {
        throw new Error('Доступ запрещен: недостаточно прав')
      }
    const stats = await ctx.prisma.group.findUnique({
      where: { id: input.id },
      select: {
        _count: {
          select: {
            students: true,
            messages: true,
          },
        },
      },
    })

    if (!stats) {
      throw Error('Группа не найдена')
    }
    return stats._count
  })

// УДАЛЕНИЕ ГРУППЫ
export const deleteGroupTrpcRoute = trpc.procedure
  .input(zDeleteGroupTrpcInput)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.me) {
      throw Error('Unauthorized')
    }
    if (!isAdmin(ctx.me?.role)  && !isDeanery(ctx.me?.role)) {
        throw new Error('Доступ запрещен: недостаточно прав')
      }
    // Благодаря onDelete: Cascade в Prisma, удаление группы
    // автоматически удалит всех студентов и их сообщения в этой группе.
    await ctx.prisma.group.delete({
      where: { id: input.id },
    })

    return true
  })
