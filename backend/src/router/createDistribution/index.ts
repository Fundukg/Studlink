import { trpc } from '../../lib/trpc'
import { zCreateDistributionTrpcInput } from './input'

export const createDistributionTrpcRoute = trpc.procedure
  .input(zCreateDistributionTrpcInput)
  .mutation(async ({ input, ctx }) => {
    //   if (Dialogue.find((dialogue) => dialogue.course === input.course)) {
    //     throw Error('Тут должна быть ошибка(Типа повоторной рассылки)')
    //   }
    const exDialogue = await ctx.prisma.dialogue.findUnique({
      where: {
        group: input.group,
      },
    })
    if (exDialogue) {
      throw Error('Тут должна быть ошибка(Типа повоторной рассылки)')
    }
   await ctx.prisma.dialogue.create({
      data: input
    })
      return true
  })
