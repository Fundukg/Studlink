import { trpc } from '../../lib/trpc'
import { getPasswordHash } from '../../utils/getPasswordHash'
import { signJWT } from '../../utils/signJWT'
import { zSignUpTrpcInput } from './input'

export const signUpTrpcRoute = trpc.procedure.input(zSignUpTrpcInput).mutation(async ({ input, ctx }) => {
  const exStaff = await ctx.prisma.staff.findUnique({
    where: {
      nick: input.nick,
    },
  })
  if (exStaff) {
    throw Error('Такой ник уже зарегистрирован')
  }
  const staff = await ctx.prisma.staff.create({
    data: {
      nick: input.nick,
      password: getPasswordHash(input.password),
    },
  })
  const token = signJWT(staff.id)
  return { token }
})
