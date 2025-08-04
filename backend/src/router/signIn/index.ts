import { trpc } from '../../lib/trpc'
import { getPasswordHash } from '../../utils/getPasswordHash'
import { signJWT } from '../../utils/signJWT'
import { zSignInTrpcInput } from './input'

export const signInTrpcRoute = trpc.procedure.input(zSignInTrpcInput).mutation(async ({ input, ctx }) => {
    const staff = await ctx.prisma.staff.findUnique({
        where: {
            nick: input.nick,
            password: getPasswordHash(input.password),
        },
    })
    if (!staff) {
        throw Error('Неверный пароль или ник')
    }
    if (staff.password !== getPasswordHash(input.password)) {
        throw Error('')
    }
    const token = signJWT(staff.id)
    return {token}
})