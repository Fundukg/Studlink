// backend/src/router/staff/updateAdmin/index.ts
import { UserRole } from '@prisma/client'
import { trpc } from '../../lib/trpc'
import { hasPermission } from '../../middleware/auth'
import { zUpdateAdminInput } from './input'

export const updateAdminTrpcRoute = trpc.procedure
  .use(hasPermission('manage:staff'))
  .input(zUpdateAdminInput)
  .mutation(async ({ input, ctx }) => {
    return await ctx.prisma.user.update({
      where: { id: input.id },
      data: {
        nick: input.nick,
        firstName: input.firstName,
        lastName: input.lastName,
        middleName: input.middleName,
        role: UserRole.ADMIN,
      },
    })
  })
