import { trpc } from '../../lib/trpc'
import { getPasswordHash } from '../../utils/getPasswordHash'
import { signJWT } from '../../utils/signJWT'
import { zSignInTrpcInput } from './input'

export const signInTrpcRoute = trpc.procedure.input(zSignInTrpcInput).mutation(async ({ input, ctx }) => {
    const user = await ctx.prisma.user.findUnique({
        where: {
            nick: input.nick,
            password: getPasswordHash(input.password),
        },
    })
    if (!user) {
        throw Error('Неверный пароль или ник')
    }
    if (user.password !== getPasswordHash(input.password)) {
        throw Error('')
    }
    const token = signJWT(user.id)
    return {token}
})
