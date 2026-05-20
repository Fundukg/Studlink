import { trpc } from '../../lib/trpc'
import { isAdmin, isDeanery } from '../../utils/role'
import { zUpdateStudentTrpcInput } from './input'

export const updateStudentTrpcRoute = trpc.procedure
  .input(zUpdateStudentTrpcInput)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.me) {
      throw Error('Unauthorized')
    }
    if (!isAdmin(ctx.me?.role) && !isDeanery(ctx.me?.role)) {
          throw new Error('Доступ запрещен: недостаточно прав')
        }
    const student = await ctx.prisma.student.findUnique({
      where: { id: input.id },
    })
    if (!student) {
      throw Error('Студент не найден')
    }
    if (input.student_id !== student.student_id) {
      const exists = await ctx.prisma.student.findUnique({
        where: { student_id: input.student_id },
      })
      if (exists) {
        throw Error('Студент с таким student_id уже существует')
      }
    }
    return await ctx.prisma.student.update({
      where: { id: input.id },
      data: {
        student_id: input.student_id,
        name: input.name,
        groupId: input.groupId,
        course: input.course,
      },
    })
  })
