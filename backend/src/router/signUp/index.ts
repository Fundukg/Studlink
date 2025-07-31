import { trpc } from '../../lib/trpc'
import { getPasswordHash } from '../../utils/getPasswordHash'
import { signJWT } from '../../utils/signJWT'
import { zSignUpTrpcInput } from './input'

export const signUpTrpcRoute = trpc.procedure.input(zSignUpTrpcInput).mutation(async ({ input, ctx }) => {
  const exDecaneryStaff = await ctx.prisma.decaneryStaff.findUnique({
    where: {
      nick: input.nick,
    },
  })
  if (exDecaneryStaff) {
    throw Error('Такой ник уже зарегистрирован')
  }
  const decaneryStaff = await ctx.prisma.decaneryStaff.create({
    data: {
      nick: input.nick,
      password: getPasswordHash(input.password),
    },
  })
  const token = signJWT(decaneryStaff.id)
  return { token }
})
