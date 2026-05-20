import { trpc } from '../../lib/trpc'
import { isAdmin, isDeanery } from '../../utils/role'
import { zDeleteDepartmentTrpcInput } from './input'

export const deleteDepartmentTrpcRoute = trpc.procedure
  .input(zDeleteDepartmentTrpcInput)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.me) {
      throw Error('Unauthorized')
    }
    if (!isAdmin(ctx.me?.role)  && !isDeanery(ctx.me?.role)) {
        throw new Error('Доступ запрещен: недостаточно прав')
      }
    // Благодаря onDelete: Cascade в Prisma, удаление кафедры
    // автоматически удалит все связанные группы и сообщения.
    await ctx.prisma.department.delete({
      where: { id: input.id },
    })

    return { success: true }
  })

export const getDepartmentDeleteStatsTrpcRoute = trpc.procedure
  .input(zDeleteDepartmentTrpcInput)
  .query(async ({ input, ctx }) => {
    if (!ctx.me) {
      throw Error('Unauthorized')
    }
    if (!isAdmin(ctx.me?.role)  && !isDeanery(ctx.me?.role)) {
        throw new Error('Доступ запрещен: недостаточно прав')
      }
    const stats = await ctx.prisma.department.findUnique({
      where: { id: input.id },
      select: {
        _count: {
          select: {
            groups: true,
            messages: true,
          },
        },
      },
    })
    return stats
  })
