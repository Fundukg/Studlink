import { trpc } from '../../lib/trpc'
import { zCreateStudentTrpcInput } from './input'

export const createStudentTrpcRoute = trpc.procedure.input(zCreateStudentTrpcInput).mutation(async ({ input, ctx }) => {
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
  const exGroup = await ctx.prisma.group.findUnique({
    where: {
      id: input.groupId,
    },
    include: {
      department: {
        include: {
          faculty: true,
        },
      },
    },
  })

  if (!exGroup) {
    throw new Error('Указанная группа не существует')
  }
  await ctx.prisma.student.create({
    data: {
      student_id: input.student_id,
      name: input.name,
      course: input.course,
      groupId: input.groupId,
      // Факультет и кафедра автоматически определяются через связь с группой
    },
  })

  return true
})
