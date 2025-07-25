import { trpc } from '../../lib/trpc'
import { getPasswordHashTrpcRoute } from '../../utils/getPasswordHash'
import { zSignUpTrpcInput } from './input'

export const signUpTrpcRoute = trpc.procedure.input(zSignUpTrpcInput).mutation(async ({ input, ctx }) => {
  const exUser = await ctx.prisma.user.findUnique({
    where: {
      nick: input.nick,
    },
  })
  if (exUser) {
    throw Error('Такой ник уже зарегистрирован')
  }
  await ctx.prisma.user.create({
    data: {
      nick: input.nick,
      password: getPasswordHashTrpcRoute(input.password),
    },
  })
  return true
})
