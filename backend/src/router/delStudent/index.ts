import { trpc } from '../../lib/trpc'
import { zDeleteStudentTrpcInput } from './input'

export const getStudentDeleteStats = trpc.procedure
  .input(zDeleteStudentTrpcInput)
  .query(async ({ input, ctx }) => {
    if (!ctx.me) {throw Error('Unauthorized')}

    const counts = await ctx.prisma.student.findUnique({
      where: { id: input.id },
      select: {
        _count: {
          select: {
            sentMessages: true,
            receivedMessages: true,
            botUsers: true,
          },
        },
      },
    })

    if (!counts) {throw Error('Студент не найден')}
    return counts._count
  })

// УДАЛЕНИЕ
export const deleteStudentTrpcRoute = trpc.procedure
  .input(zDeleteStudentTrpcInput)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.me) {throw Error('Unauthorized')}

    // Благодаря Cascade в Prisma, удалятся и сообщения, и привязки к ботам
    await ctx.prisma.student.delete({
      where: { id: input.id },
    })

    return true
  })
