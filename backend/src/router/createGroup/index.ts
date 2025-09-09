import { trpc } from '../../lib/trpc'
import { zCreateGroupTrpcInput } from './input'

export const createGroupTrpcRoute = trpc.procedure
  .input(zCreateGroupTrpcInput)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.me) {
      throw Error('Unauthorized')
    }
    const exGroup = await ctx.prisma.group.findUnique({
      where: {
        name: input.name,
      },
    })
    if (exGroup) {
      throw Error('Такая группа уже зарегистрирована')
    }
    await ctx.prisma.group.create({
      data: {
        name: input.name,
        departmentId: input.departmentId,
      },
    })
    return true
  })
