// backend/src/router/auth/signIn.ts
import { TRPCError } from '@trpc/server'
import { trpc } from '../../lib/trpc'
import { getPasswordHash } from '../../utils/getPasswordHash'
import { signJWT } from '../../utils/signJWT'
import { zSignInTrpcInput } from './input'

export const signInTrpcRoute = trpc.procedure
  .input(zSignInTrpcInput)
  .mutation(async ({ input, ctx }) => {
    // 1. Ищем пользователя по нику
    const user = await ctx.prisma.user.findUnique({
      where: {
        nick: input.nick,
      },
    })

    // 2. Проверяем существование и пароль
    // Важно: всегда сравниваем хэш, полученный из БД, с хэшем введенного пароля
    if (!user || user.password !== getPasswordHash(input.password)) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Неверный логин или пароль',
      })
    }

    // 3. Генерация токена для найденного пользователя
    const token = signJWT(user.id)

    return {
      token,
      user: {
        id: user.id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    }
  })
