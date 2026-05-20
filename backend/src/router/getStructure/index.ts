import { z } from 'zod'
import { trpc } from '../../lib/trpc' // Путь к вашему инстансу trpc

export const getStructureTrpcRoute = trpc.router({
  // 1. Получить все факультеты (только ID и Название)
  getFaculties: trpc.procedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.faculty.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      throw new Error('Ошибка при загрузке факультетов')
    }
  }),

  // 2. Получить кафедры, привязанные к факультету
  getDepartmentsByFaculty: trpc.procedure
    .input(
      z.object({
        facultyId: z.string().min(1, 'ID факультета обязателен'),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        return await ctx.prisma.department.findMany({
          where: { facultyId: input.facultyId },
          select: {
            id: true,
            name: true,
          },
          orderBy: { name: 'asc' },
        })
      } catch (error) {
        throw new Error('Ошибка при загрузке кафедр')
      }
    }),

  // 3. Получить группы кафедры с фильтром по курсу
  getGroupsByDepartment: trpc.procedure
    .input(
      z.object({
        departmentId: z.string().min(1, 'ID кафедры обязателен'),
        course: z.string().min(1).max(6).optional(), // Опциональный фильтр по курсу
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        return await ctx.prisma.group.findMany({
          where: {
            departmentId: input.departmentId,
            ...(input.course ? { course: input.course } : {}), // Добавляем фильтр, если он передан
          },
          select: {
            id: true,
            name: true,
            course: true,
          },
          orderBy: [{ course: 'asc' }, { name: 'asc' }],
        })
      } catch (error) {
        throw new Error('Ошибка при загрузке групп')
      }
    }),
  // Добавьте это в structureRouter
  getAvailableCourses: trpc.procedure
    .input(z.object({ departmentId: z.string() }))
    .query(async ({ input, ctx }) => {
      const groups = await ctx.prisma.group.findMany({
        where: { departmentId: input.departmentId },
        select: { course: true },
        distinct: ['course'], // Берем только уникальные значения
      })

      return groups.map((g) => g.course).sort((a, b) => Number(a) - Number(b)) // Возвращаем массив типа [1, 2, 4]
    }),
})
