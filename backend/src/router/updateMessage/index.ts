import { trpc } from '../../lib/trpc'
import { zUpdateMessageTrpcInput } from './input'

export const updateMessageTrpcRoute = trpc.procedure.input(zUpdateMessageTrpcInput).mutation(async ({ ctx, input }) => {
  const { dialogueId, ...dialogueInput } = input
  if (!ctx.me) {
    throw new Error('UNAUTHORIZED')
  }
  const dialogue = await ctx.prisma.dialogue.findUnique({
    where: {
      id: dialogueId,
    },
  })
  if (!dialogue) {
    throw new Error('NOT_FOUND')
  }
  if (ctx.me.id !== dialogue.authorId) {
    throw new Error('NOT_YOUR_IDEA')
  }
  if (dialogue.group !== input.group) {
    const exDialogue = await ctx.prisma.dialogue.findUnique({
      where: {
        group: input.group,
      },
    })
    if (exDialogue) {
      throw new Error('Idea with this nick already exists')
    }
  }
  await ctx.prisma.dialogue.update({
    where: {
      id: dialogueId,
    },
    data: {
      ...dialogueInput,
    },
  })
  return true
})