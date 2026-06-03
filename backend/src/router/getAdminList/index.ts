import { UserRole } from '@prisma/client'
import { trpc } from '../../lib/trpc'
import { hasPermission } from '../../middleware/auth'

export const getAdminListTrpcRoute = trpc.procedure
  .use(hasPermission('view:staff'))
  .query(async ({ ctx }) => {
    const admins = await ctx.prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      select: {
        id: true,
        nick: true,
        firstName: true,
        lastName: true,
        middleName: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            sentMessages: true,
            receivedMessages: true,
          },
        },
      },
      orderBy: { lastName: 'asc' },
    })

    const formattedList = admins.map((user) => ({
      id: user.id,
      nick: user.nick,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      stats: user._count,
      createdAt: user.createdAt,
    }))
    return { formattedList }
  })
