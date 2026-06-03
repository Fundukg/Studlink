// backend/src/router/staff/delete.ts
import { TRPCError } from '@trpc/server'
import { trpc } from '../../lib/trpc'
import { hasPermission } from '../../middleware/auth'
import { zDeleteStaffTrpcInput } from './input'

const staffManageProcedure = trpc.procedure.use(hasPermission('manage:staff'))

// 1. Статистика (подходит для любого сотрудника)
export const getStaffDeleteStatsTrpcRoute = staffManageProcedure
  .input(zDeleteStaffTrpcInput)
  .query(async ({ input, ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: input.id },
      select: {
        role: true,
        sentMessages: true, // Просто берем связи для подсчета
        receivedMessages: true,
        teacherProfile: {
          select: {
            assignments: true // Вот где лежат assignments преподавателя
          }
        }
      },
    })

    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Пользователь не найден' })
    }

    // Формируем объект статистики вручную
    return {
      sentMessages: user.sentMessages.length,
      receivedMessages: user.receivedMessages.length,
      teacherAssignments: user.teacherProfile?.assignments.length || 0
    }
  })

// 2. Удаление
export const deleteStaffTrpcRoute = staffManageProcedure
  .input(zDeleteStaffTrpcInput)
  .mutation(async ({ input, ctx }) => {
    if (ctx.me.id === input.id) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Нельзя удалить себя',
      })
    }

    // Prisma с onDelete: Cascade удалит профили (Teacher/Deanery) и связи автоматически
    try {
      await ctx.prisma.user.delete({
        where: { id: input.id },
      })
      return { success: true }
    } catch (e) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Ошибка при удалении пользователя',
      })
    }
  })
