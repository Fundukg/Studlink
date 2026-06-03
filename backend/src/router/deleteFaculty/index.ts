// backend/src/router/faculty/delete.ts
import { TRPCError } from '@trpc/server'
import { trpc } from '../../lib/trpc'
import { hasPermission } from '../../middleware/auth'
import { zDeleteFacultyTrpcInput } from './input'

// Задаем процедуру с автоматической проверкой прав на управление структурой вуза
const structureManageProcedure = trpc.procedure.use(
  hasPermission('manage:structure')
)

// 1. РОУТ ПОЛУЧЕНИЯ СТАТИСТИКИ ПЕРЕД УДАЛЕНИЕМ
export const getFacultyDeleteStatsTrpcRoute = structureManageProcedure
  .input(zDeleteFacultyTrpcInput)
  .query(async ({ input, ctx }) => {
    // Гарантировано мидлварой: ctx.me существует и имеет права ADMIN/DEANERY

    // Считаем кафедры и группы, которые каскадно удалятся вместе с факультетом
    const faculty = await ctx.prisma.faculty.findUnique({
      where: { id: input.id },
      include: {
        _count: {
          select: {
            departments: true, // Сколько кафедр на факультете
          },
        },
        departments: {
          include: {
            _count: {
              select: {
                groups: true, // Сколько групп на каждой кафедре
              },
            },
          },
        },
      },
    })

    if (!faculty) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Факультет не найден в системе',
      })
    }

    // Агрегируем (складываем) количество групп и преподавателей со всех кафедр факультета
    const totalGroupsCount = faculty.departments.reduce(
      (acc, dep) => acc + dep._count.groups,
      0
    )


    return {
      departments: faculty._count.departments,
      groups: totalGroupsCount,
    }
  })

// 2. РОУТ УДАЛЕНИЯ ФАКУЛЬТЕТА
export const deleteFacultyTrpcRoute = structureManageProcedure
  .input(zDeleteFacultyTrpcInput)
  .mutation(async ({ input, ctx }) => {
    // Проверяем существование перед удалением
    const facultyExists = await ctx.prisma.faculty.findUnique({
      where: { id: input.id },
    })

    if (!facultyExists) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Указанный факультет не найден',
      })
    }

    // Каскадное удаление (onDelete: Cascade) в Prisma сотрет:
    // Факультет -> Связанные Кафедры -> Связанные Группы.
    // Студенты (StudentProfile) привязаны к группам, при удалении групп у них groupId станет null.
    // Сообщения и рассылки, как мы выяснили, остаются в базе в целости и сохранности!
    await ctx.prisma.faculty.delete({
      where: { id: input.id },
    })

    return { success: true }
  })
