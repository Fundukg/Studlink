import { trpc } from '../../lib/trpc'

export const getWorkDeskTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  // return { Dialogue: Dialogue.map((dialogue) => _.pick(dialogue, ['course', 'department', 'directions', 'group', 'message'])) }
  const Dialogue = await ctx.prisma.dialogue.findMany({
    select: {
      id: true,
      course: true,
      department: true,
      directions: true,
      group: true,
      message: true,
    },
  })
  return { Dialogue }
})
