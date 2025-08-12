import { trpc } from '../../lib/trpc'   
import { zCreateStudentTrpcInput } from './input'

export const createStudentTrpcRoute = trpc.procedure
    .input(zCreateStudentTrpcInput)
    .mutation(async ({ input, ctx }) => {
        if (!ctx.me) {
            throw Error('Unauthorized')
        }
        const exStudent = await ctx.prisma.student.findUnique({
            where: {
                student_id: input.student_id,
            },
        })
        if (exStudent) {
            throw Error('Такой студент уже зарегистрирован')
        }
        await ctx.prisma.student.create({
            data: input,
        })
        return true
    })