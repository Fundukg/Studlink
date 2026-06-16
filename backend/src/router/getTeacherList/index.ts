// backend/src/router/staff/getTeacherList/index.ts
import { UserRole } from '@prisma/client'
import { trpc } from '../../lib/trpc'
import { hasPermission } from '../../middleware/auth'

export const getTeacherListTrpcRoute = trpc.procedure
  .use(hasPermission('view:staff'))
  .query(async ({ ctx }) => {
    const teachers = await ctx.prisma.user.findMany({
      where: { role: UserRole.TEACHER },
      select: {
        id: true,
        nick: true,
        firstName: true,
        lastName: true,
        middleName: true,
        createdAt: true,
        firstLogin: true,
        teacherProfile: {
          select: {
            assignments: {
              select: {
                group: { select: { name: true, id: true } },
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
        _count: {
          select: {
            sentMessages: true,
            receivedMessages: true,
          },
        },
      },
      orderBy: { lastName: 'asc' },
    })

    // Форматируем для удобного вывода групп на фронте
    const formattedList = teachers.map((user) => ({
      id: user.id,
      nick: user.nick,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      groups: user.teacherProfile?.assignments.map((a) => a.group.name) || [],
      groupIds: user.teacherProfile?.assignments.map((a) => a.group.id) || [],
      stats: user._count,
      bots: user.botUsers.map((b) => b.bot.platform),
      createdAt: user.createdAt,
    }))

    return { staff: formattedList }
  })
