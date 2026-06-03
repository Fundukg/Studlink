// backend/src/router/student/getOne.ts
import { TRPCError } from '@trpc/server'
import { trpc } from '../../lib/trpc'
import { hasPermission } from '../../middleware/auth'
import { zGetOneStudentTrpcInput } from './input'

export const getOneStudentTrpcRoute = trpc.procedure
  .use(hasPermission('view:students',)) // Доступ только с правами чтения
  .input(zGetOneStudentTrpcInput)
  .query(async ({ input, ctx }) => {
    // Ищем пользователя, принудительно проверяя, что это студент
    const student = await ctx.prisma.user.findUnique({
      where: {
        id: input.id,
        role: 'STUDENT',
      },
      include: {
        studentProfile: {
          include: {
            group: {
              include: {
                department: {
                  include: {
                    faculty: true, // Иерархия: Студент -> Группа -> Кафедра -> Факультет
                  },
                },
              },
            },
          },
        },
        botUsers: {
          include: {
            bot: true, // Авторизации в ботах
          },
        },
        _count: {
          select: {
            sentMessages: true,
            receivedMessages: true,
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

    return student
  })
