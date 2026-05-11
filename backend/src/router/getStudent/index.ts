import { trpc } from '../../lib/trpc'

export const getStudentTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  const Student = await ctx.prisma.student.findMany({
    select: {
      id: true,
      student_id: true,
      name: true,
      course: true,
      group: {
        select: {
          id: true,
          name: true,
          department: {
            select: {
              id: true,
              name: true,
              faculty: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      createdAt: true,
      // Добавляем получение данных об авторизациях в ботах 
      botUsers: {
        where: {
          isActive: true, // Рекомендуется выбирать только активные привязки 
        },
        select: {
          externalId: true, // ID пользователя в мессенджере [cite: 1]
          bot: {
            select: {
              id: true,
              platform: true,
              name: true,
              // Здесь можно добавить platform или name бота из модели Bot 
            },
          },
        },
      },
    },
  })
  return { Student }
})