// backend/src/router/staff/createAdmin/index.ts
import { UserRole } from '@prisma/client'
import { trpc } from '../../lib/trpc'
import { hasPermission } from '../../middleware/auth'
import { getPasswordHash } from '../../utils/getPasswordHash'
import { zCreateAdminInput } from './input'

export const createAdminTrpcRoute = trpc.procedure
  .use(hasPermission('manage:staff'))
  .input(zCreateAdminInput)
  .mutation(async ({ input, ctx }) => {
    const user = await ctx.prisma.user.create({
      data: {
        nick: input.nick,
        password: getPasswordHash(input.password),
        firstName: input.firstName,
        lastName: input.lastName,
        middleName: input.middleName,
        role: UserRole.ADMIN,
      },
    })
    return { userId: user.id }
  })
