import { trpc } from '../../lib/trpc'

export const getStaffTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  const Staff = await ctx.prisma.staff.findMany({
    select: {
      id: true,
      nick: true,
      createdAt: true,
      password: true,
      sentMessages:{
        select: {
          id: true

        }
      },
      receivedMessages: {
        select: {
          id: true
        }
      }
    },

    orderBy: {
      nick: 'asc',
    },
  })
  return { Staff }
})
