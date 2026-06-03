// backend/src/router/structure/index.ts
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { trpc } from '../../lib/trpc'
import { isAuthenticated, isDeanery, isTeacher } from '../../middleware/auth'

export const getStructureTrpcRoute = trpc.router({
  getFaculties: trpc.procedure.use(isAuthenticated).query(async ({ ctx }) => {
    try {
      // Деканат видит только свой факультет? Обычно деканат работает в рамках одного факультета.
      // Для преподавателей и администраторов показываем все факультеты.
      const me = ctx.me!
      if (isDeanery(me.role)) {
        const deanery = await ctx.prisma.deaneryProfile.findUnique({
          where: { userId: me.id },
          select: { facultyId: true },
        })
        if (!deanery) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Профиль деканата не найден',
          })
        }
        return await ctx.prisma.faculty.findMany({
          where: { id: deanery.facultyId },
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        })
      }
      // Для админа и преподавателя – все факультеты (преподаватель может работать с разными факультетами)
      return await ctx.prisma.faculty.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Ошибка при загрузке факультетов',
      })
    }
  }),

  getDepartmentsByFaculty: trpc.procedure
    .use(isAuthenticated)
    .input(z.object({ facultyId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const me = ctx.me!
      try {
        // Деканат: может видеть кафедры только своего факультета
        if (isDeanery(me.role)) {
          const deanery = await ctx.prisma.deaneryProfile.findUnique({
            where: { userId: me.id },
            select: { facultyId: true },
          })
          if (!deanery || deanery.facultyId !== input.facultyId) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Нет доступа к этому факультету',
            })
          }
        }
        // Преподаватель: может видеть кафедры любых факультетов (администратор – аналогично)
        return await ctx.prisma.department.findMany({
          where: { facultyId: input.facultyId },
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        })
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Ошибка при загрузке кафедр',
        })
      }
    }),

  getGroupsByDepartment: trpc.procedure
    .use(isAuthenticated)
    .input(
      z.object({
        departmentId: z.string().uuid(),
        course: z.number().min(1).max(6).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const me = ctx.me!
      try {
        const whereCondition: any = {
          departmentId: input.departmentId,
          ...(input.course ? { course: input.course } : {}),
        }

        // Преподаватель: только те группы, которые к нему привязаны
        if (isTeacher(me.role)) {
          const teacherProfile = await ctx.prisma.teacherProfile.findUnique({
            where: { userId: me.id },
            select: { assignments: { select: { groupId: true } } },
          })
          if (!teacherProfile) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Профиль преподавателя не найден',
            })
          }
          const allowedGroupIds = teacherProfile.assignments.map(
            (a) => a.groupId
          )
          whereCondition.id = { in: allowedGroupIds }
        }
        // Деканат: видит все группы своего факультета (проверка через кафедру)
        else if (isDeanery(me.role)) {
          const deanery = await ctx.prisma.deaneryProfile.findUnique({
            where: { userId: me.id },
            select: { facultyId: true },
          })
          if (!deanery) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Профиль деканата не найден',
            })
          }
          // Проверяем, что кафедра принадлежит факультету декана
          const department = await ctx.prisma.department.findUnique({
            where: { id: input.departmentId },
            select: { facultyId: true },
          })
          if (!department || department.facultyId !== deanery.facultyId) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Нет доступа к этой кафедре',
            })
          }
          // Для деканата дополнительная фильтрация групп не нужна – все группы кафедры его факультета
        }

        const groups = await ctx.prisma.group.findMany({
          where: whereCondition,
          select: { id: true, name: true, course: true },
          orderBy: [{ course: 'asc' }, { name: 'asc' }],
        })
        return groups
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Ошибка при загрузке групп',
        })
      }
    }),

  getAvailableCourses: trpc.procedure
    .use(isAuthenticated)
    .input(z.object({ departmentId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const me = ctx.me!
      try {
        const whereCondition: any = { departmentId: input.departmentId }

        // Преподаватель: курсы только из его групп
        if (isTeacher(me.role)) {
          const teacherProfile = await ctx.prisma.teacherProfile.findUnique({
            where: { userId: me.id },
            select: {
              assignments: { select: { group: { select: { course: true, id: true } } } },
            },
          })
          if (!teacherProfile) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Профиль преподавателя не найден',
            })
          }
          const allowedGroupIds = teacherProfile.assignments.map(
            (a) => a.group
          )
          whereCondition.id = { in: allowedGroupIds }
        }
        // Деканат: курсы доступных групп (все группы его факультета)
        else if (isDeanery(me.role)) {
          const deanery = await ctx.prisma.deaneryProfile.findUnique({
            where: { userId: me.id },
            select: { facultyId: true },
          })
          if (!deanery) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Профиль деканата не найден',
            })
          }
          const department = await ctx.prisma.department.findUnique({
            where: { id: input.departmentId },
            select: { facultyId: true },
          })
          if (!department || department.facultyId !== deanery.facultyId) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Нет доступа к этой кафедре',
            })
          }
          // Для деканата дополнительная фильтрация не требуется – кафедра уже проверена
        }

        const groups = await ctx.prisma.group.findMany({
          where: whereCondition,
          select: { course: true },
          distinct: ['course'],
        })
        return groups.map((g) => g.course).sort((a, b) => a - b)
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Ошибка при получении курсов',
        })
      }
    }),
})
