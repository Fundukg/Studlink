// backend/src/router/department/delete.ts
import { TRPCError } from '@trpc/server'
import { trpc } from '../../lib/trpc'
import { hasPermission } from '../../middleware/auth'
import { zDeleteDepartmentTrpcInput } from './input'

// Задаем общую процедуру с проверкой прав на управление учебной структурой
const structureManageProcedure = trpc.procedure.use(hasPermission('manage:structure'))

// 1. Роут удаления кафедры
export const deleteDepartmentTrpcRoute = structureManageProcedure
  .input(zDeleteDepartmentTrpcInput)
  .mutation(async ({ input, ctx }) => {
    // Гарантировано мидлварой: ctx.me существует и обладает правами ADMIN или DEANERY

    // Проверяем существование кафедры перед удалением
    const departmentExists = await ctx.prisma.department.findUnique({
      where: { id: input.id },
    })

    if (!departmentExists) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Указанная кафедра не найдена в системе',
      })
    }

    // Благодаря onDelete: Cascade в Prisma, удаление кафедры автоматически 
    // удалит все связанные группы и профили преподавателей (выставит им null).
    await ctx.prisma.department.delete({
      where: { id: input.id },
    })

    return { success: true }
  })

// 2. Роут получения статистики перед удалением (сколько групп будет затронуто)
export const getDepartmentDeleteStatsTrpcRoute = structureManageProcedure
  .input(zDeleteDepartmentTrpcInput)
  .query(async ({ input, ctx }) => {
    // Здесь также теперь работает автоматическая мидлвара контроля доступа

    const stats = await ctx.prisma.department.findUnique({
      where: { id: input.id },
      select: {
        _count: {
          select: {
            groups: true,
          },
        },
      },
    })

    if (!stats) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Кафедра не найдена',
      })
    }

    return stats
  })