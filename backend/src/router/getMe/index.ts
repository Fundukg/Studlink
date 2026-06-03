import { UserRole } from '@prisma/client'
import _ from 'lodash'
import { trpc } from '../../lib/trpc'

export const getMeTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  const me = ctx.me
  if (!me) {return { me: null }}

  // Загружаем пользователя со всеми связанными профилями
  const userWithProfile = await ctx.prisma.user.findUnique({
    where: { id: me.id },
    select: {
      id: true,
      nick: true,
      lastName: true,
      firstName: true,
      middleName: true,
      role: true,
      createdAt: true,
      email: true,
      phone: true,
      studentProfile: {
        select: {
          student_id: true,
          course: true,
          isLeader: true,
          group: {
            select: {
              id: true,
              name: true,
              course: true,
              department: {
                select: {
                  id: true,
                  name: true,
                  faculty: {
                    select: { id: true, name: true },
                  },
                },
              },
            },
          },
        },
      },
      teacherProfile: {
        select: {
          id: true,
          subjects: true,
          assignments: {
            select: {
              roleInGroup: true,
              group: {
                select: {
                  id: true,
                  name: true,
                  course: true,
                  department: {
                    select: {
                      id: true,
                      name: true,
                      faculty: {
                        select: { id: true, name: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      deaneryProfile: {
        select: {
          faculty: {
            select: { id: true, name: true },
          },
        },
      },
    },
  })

  // Базовые поля пользователя
  const result: any = {
    id: userWithProfile?.id,
    nick: userWithProfile?.nick,
    lastName: userWithProfile?.lastName,
    firstName: userWithProfile?.firstName,
    middleName: userWithProfile?.middleName,
    role: userWithProfile?.role,
    createdAt: userWithProfile?.createdAt,
    email: userWithProfile?.email,
    phone: userWithProfile?.phone,
  }

  // Добавляем данные профиля в зависимости от роли
  if (
    userWithProfile?.role === UserRole.STUDENT &&
    userWithProfile?.studentProfile
  ) {
    result.student = {
      studentId: userWithProfile?.studentProfile.student_id,
      course: userWithProfile?.studentProfile.course,
      isLeader: userWithProfile?.studentProfile.isLeader,
      group: userWithProfile?.studentProfile.group
        ? {
            id: userWithProfile?.studentProfile.group.id,
            name: userWithProfile?.studentProfile.group.name,
            course: userWithProfile?.studentProfile.group.course,
            department: userWithProfile?.studentProfile.group.department?.name,
            faculty:
              userWithProfile?.studentProfile.group.department?.faculty?.name,
          }
        : null,
    }
  } else if (
    userWithProfile?.role === UserRole.TEACHER &&
    userWithProfile?.teacherProfile
  ) {
    result.teacher = {
      id: userWithProfile?.teacherProfile.id,
      subjects: userWithProfile?.teacherProfile.subjects,
      assignments: userWithProfile?.teacherProfile.assignments.map((a) => ({
        roleInGroup: a.roleInGroup,
        group: {
          id: a.group.id,
          name: a.group.name,
          course: a.group.course,
          department: a.group.department?.name,
          faculty: a.group.department?.faculty?.name,
        },
      })),
    }
  } else if (
    userWithProfile?.role === UserRole.DEANERY &&
    userWithProfile?.deaneryProfile
  ) {
    result.deanery = {
      faculty: userWithProfile?.deaneryProfile.faculty,
    }
  }

  return { me: result }
})
