import { trpc } from '../../lib/trpc'
import { isAdmin } from '../../utils/role'
import { zStaffUpdateTrpcInput } from './input'

export const updateStaffTrpcRoute = trpc.procedure
  .input(zStaffUpdateTrpcInput)
  .mutation(async ({ input, ctx }) => {
    if (!isAdmin(ctx.me?.role)) {
      throw new Error('Недостаточно прав')
    }

    return await ctx.prisma.staff.update({
      where: { id: input.id },
      data: {
        nick: input.nick,
        firstName: input.firstName,
        lastName: input.lastName,
        middleName: input.middleName,
        role: input.role,
      },
    })
  })
