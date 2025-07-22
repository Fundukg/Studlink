import z from 'zod' 
import { trpc } from '../../lib/trpc'

export const getDialoguesTrpcRoute = trpc.procedure
  .input(
    z.object({
      dialogue: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const Dialogue = await ctx.prisma.dialogue.findUnique({
      where: {
        group: input.dialogue,
      },
    })
    return { Dialogue }
  })
