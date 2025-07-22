import { trpc } from '../../lib/trpc'

export const getWorkDeskTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  
  const Dialogue = await ctx.prisma.dialogue.findMany({
    select: {
      id: true,
      course: true,
      department: true,
      directions: true,
      group: true,
      message: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  return { Dialogue }
})
