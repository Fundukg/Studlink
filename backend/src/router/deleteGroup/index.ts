// backend/src/router/group/delete.ts
import { TRPCError } from '@trpc/server'
import { trpc } from '../../lib/trpc'
import { hasPermission } from '../../middleware/auth'
import { zDeleteGroupTrpcInput } from './input'

// Используем общую процедуру с автоматической проверкой прав на управление структурой
const structureManageProcedure = trpc.procedure.use(
  hasPermission('manage:structure')
)

// 1. Роут получения статистики перед удалением группы
export const getGroupDeleteStatsTrpcRoute = structureManageProcedure
  .input(zDeleteGroupTrpcInput)
  .query(async ({ input, ctx }) => {
    // Гарантировано мидлварой: ctx.me существует и это ADMIN или DEANERY

    const group = await ctx.prisma.group.findUnique({
      where: { id: input.id },
      select: {
        _count: {
          select: {
            students: true, // Показываем, сколько студентов учится в этой группе
          },
        },
      },
    })

    if (!group) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Указанная учебная группа не найдена в системе',
      })
    }

    return {
      students: group._count.students, // Фронтенд получит количество затронутых студентов
    }
  })

// 2. Роут непосредственного УДАЛЕНИЯ группы
export const deleteGroupTrpcRoute = structureManageProcedure
  .input(zDeleteGroupTrpcInput)
  .mutation(async ({ input, ctx }) => {
    // Проверяем существование группы перед удалением
    const groupExists = await ctx.prisma.group.findUnique({
      where: { id: input.id },
    })

    if (!groupExists) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Группа не найдена',
      })
    }

    // Удаляем группу.
    // Внимание: Благодаря onDelete: SetNull в StudentProfile, сами записи пользователей
    // и их студенческие профили НЕ удалятся — у студентов просто очистится поле groupId.
    // Сообщения также остаются в полной сохранности в истории.
    await ctx.prisma.group.delete({
      where: { id: input.id },
    })

    return { success: true }
  })
