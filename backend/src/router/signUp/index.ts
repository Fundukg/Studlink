import { trpc } from '../../lib/trpc'
import { getPasswordHash } from '../../utils/getPasswordHash'
import { isAdmin } from '../../utils/role'
import { signJWT } from '../../utils/signJWT'
import { zSignUpTrpcInput } from './input'

export const signUpTrpcRoute = trpc.procedure.input(zSignUpTrpcInput).mutation(async ({ input, ctx }) => {
  const exStaff = await ctx.prisma.staff.findUnique({
    where: {
      nick: input.nick,
    },
  })
  if (!isAdmin(ctx.me?.role)) {
    throw new Error('Недостаточно прав')
  }
  if (exStaff) {
    throw Error('Такой ник уже зарегистрирован')
  }
  const staff = await ctx.prisma.staff.create({
    data: {
      nick: input.nick,
      password: getPasswordHash(input.password),
      firstName: input.firstName,  
      lastName: input.lastName,
      middleName: input.middleName,
      role: input.role, 
    },
  })
  const token = signJWT(staff.id)
  return { token }
})
