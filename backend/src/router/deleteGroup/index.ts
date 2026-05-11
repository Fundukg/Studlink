import { trpc } from '../../lib/trpc'
import { zDeleteGroupTrpcInput } from './input'

export const getGroupDeleteStats = trpc.procedure.input(zDeleteGroupTrpcInput).query(async ({ input, ctx }) => {
  if (!ctx.me) {
    throw Error('Unauthorized')
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
export const deleteGroupTrpcRoute = trpc.procedure.input(zDeleteGroupTrpcInput).mutation(async ({ input, ctx }) => {
  if (!ctx.me) {
    throw Error('Unauthorized')
  }

  // Благодаря onDelete: Cascade в Prisma, удаление группы
  // автоматически удалит всех студентов и их сообщения в этой группе.
  await ctx.prisma.group.delete({
    where: { id: input.id },
  })

  return true
})
