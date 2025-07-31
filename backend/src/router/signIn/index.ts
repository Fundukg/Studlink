import { trpc } from '../../lib/trpc'
import { getPasswordHash } from '../../utils/getPasswordHash'
import { signJWT } from '../../utils/signJWT'
import { zSignInTrpcInput } from './input'

export const signInTrpcRoute = trpc.procedure.input(zSignInTrpcInput).mutation(async ({ input, ctx }) => {
    const decaneryStaff = await ctx.prisma.decaneryStaff.findUnique({
        where: {
            nick: input.nick,
            password: getPasswordHash(input.password),
        },
    })
    if (!decaneryStaff) {
        throw Error('Неверный пароль или ник')
    }
    if (decaneryStaff.password !== getPasswordHash(input.password)) {
        throw Error('')
    }
    const token = signJWT(decaneryStaff.id)
    return {token}
})