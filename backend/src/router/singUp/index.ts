import crypto from 'crypto'
import { trpc } from '../../lib/trpc'
import { zSingUpTrpcInput } from './input'

export const singUpTrpcRoute = trpc.procedure.input(zSingUpTrpcInput).mutation(async ({ input, ctx }) => {
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
      password: crypto.createHash('sha256').update(input.password).digest('hex'),
    },
  })
  return true
})
