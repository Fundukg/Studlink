// backend/src/router/student/getList.ts
import { UserRole } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { trpc } from '../../lib/trpc'
import { hasPermission, isDeanery, isTeacher } from '../../middleware/auth' // добавим isTeacher

export const getStudentTrpcRoute = trpc.procedure
  .use(hasPermission('view:students'))
  .query(async ({ ctx }) => {
    const me = ctx.me!

    // Базовый фильтр: только студенты
    const userWhere: any = { role: UserRole.STUDENT }

    // 1. Деканат: студенты своего факультета
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
      userWhere.studentProfile = {
        group: {
          department: { facultyId: deanery.facultyId },
        },
      }
    }

    // 2. Преподаватель: студенты своих групп
    else if (isTeacher(me.role)) {
      // Получаем ID групп, к которым привязан преподаватель
      const teacherProfile = await ctx.prisma.teacherProfile.findUnique({
        where: { userId: me.id },
        select: {
          assignments: {
            select: { groupId: true },
          },
        },
      })
      if (!teacherProfile) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Профиль преподавателя не найден',
        })
      }
      const groupIds = teacherProfile.assignments.map((a) => a.groupId)
      if (groupIds.length === 0) {
        // Если нет привязанных групп, возвращаем пустой список (либо можно вернуть пустой массив)
        return { students: [] }
      }
      userWhere.studentProfile = {
        groupId: { in: groupIds },
      }
    }

    // 3. Администратор (и любые другие роли без ограничений) – фильтр только по role: STUDENT

    try {
      const students = await ctx.prisma.user.findMany({
        where: userWhere,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
          email: true,
          studentProfile: {
            select: {
              student_id: true,
              course: true,
              group: {
                select: {
                  name: true,
                  department: {
                    select: {
                      name: true,
                      faculty: { select: { name: true } },
                    },
                  },
                },
              },
            },
          },
          botUsers: {
            where: { isActive: true },
            select: {
              bot: { select: { platform: true, name: true } },
            },
          },
          createdAt: true,
        },
        orderBy: { lastName: 'asc' },
      })

      // Форматируем для фронтенда
      return {
        students: students.map((s) => ({
          id: s.id,
          lastName: s.lastName,
          firstName: s.firstName,
          middleName: s.middleName,
          student_id: s.studentProfile?.student_id,
          course: s.studentProfile?.course,
          group: s.studentProfile?.group?.name,
          faculty: s.studentProfile?.group?.department.faculty.name,
          department: s.studentProfile?.group?.department.name,
          bots: s.botUsers.map((b) => b.bot.platform),
          createdAt: s.createdAt,
        })),
      }
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Ошибка при загрузке студентов',
      })
    }
  })
