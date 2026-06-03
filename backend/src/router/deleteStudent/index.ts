// backend/src/router/student/delete.ts
import { TRPCError } from '@trpc/server'
import { trpc } from '../../lib/trpc'
import { hasPermission } from '../../middleware/auth'
import { zDeleteStudentTrpcInput } from './input'

// Роут доступен администраторам и деканату
const studentManageProcedure = trpc.procedure.use(
  hasPermission('manage:students')
)

// 1. СТАТИСТИКА ПЕРЕД УДАЛЕНИЕМ
export const getStudentDeleteStatsTrpcRoute = studentManageProcedure
  .input(zDeleteStudentTrpcInput)
  .query(async ({ input, ctx }) => {
    const student = await ctx.prisma.user.findUnique({
      where: {
        id: input.id,
        role: 'STUDENT', // Убеждаемся, что работаем именно со студентом
      },
      select: {
        _count: {
          select: {
            sentMessages: true, // Сообщения, отправленные студентом
            receivedMessages: true, // Сообщения, полученные студентом
            botUsers: true, // Сколько аккаунтов в ботах привязано
          },
        },
      },
    })

    if (!student) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Студент не найден в системе',
      })
    }

    return student._count
  })

// 2. УДАЛЕНИЕ СТУДЕНТА
export const deleteStudentTrpcRoute = studentManageProcedure
  .input(zDeleteStudentTrpcInput)
  .mutation(async ({ input, ctx }) => {
    // Проверяем существование
    const student = await ctx.prisma.user.findUnique({
      where: {
        id: input.id,
        role: 'STUDENT',
      },
    })

    if (!student) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Студент не найден',
      })
    }

    // Удаляем пользователя.
    // Prisma Cascade автоматически удалит StudentProfile и BotUser.
    // История сообщений:
    // - Если студент отправил сообщение: оно останется в БД (senderId станет null)
    // - Если сообщение пришло студенту: оно удалится (т.к. recipientId в Cascade)
    await ctx.prisma.user.delete({
      where: { id: input.id },
    })

    return { success: true }
  })
