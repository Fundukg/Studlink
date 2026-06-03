// backend/src/router/staff/getList.ts
import { UserRole } from '@prisma/client'
import { trpc } from '../../lib/trpc'
import { hasPermission } from '../../middleware/auth'

export const getDeaneryListTrpcRoute = trpc.procedure
  .use(hasPermission('view:staff')) // Право на просмотр списка пользователей
  .query(async ({ ctx }) => {
    // ADMIN видит всех сотрудников деканата,
    // DEANERY может видеть своих коллег (если нужно, можно ограничить)

    const deaneryList = await ctx.prisma.user.findMany({
      where: {
        role: UserRole.DEANERY,
      },
      select: {
        id: true,
        nick: true,
        firstName: true,
        lastName: true,
        middleName: true,
        createdAt: true,
        role: true,
        // Подтягиваем факультет, за который отвечает декан
        deaneryProfile: {
          select: {
            faculty: {
              select: { name: true },
            },
          },
        },
        _count: {
          select: {
            sentMessages: true,
            receivedMessages: true,
          },
        },
      },
      orderBy: {
        lastName: 'asc',
      },
    })

    // Форматируем ответ для фронтенда
    const formattedList = deaneryList.map((user) => ({
      id: user.id,
      nick: user.nick,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      role: user.role,
      facultyName: user.deaneryProfile?.faculty?.name || 'Не назначен',
      stats: user._count,
      createdAt: user.createdAt,
    }))

    return { staff: formattedList }
  })
