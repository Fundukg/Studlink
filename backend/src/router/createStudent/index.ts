import z from 'zod'
import { trpc } from '../../lib/trpc'
import { zCreateStudentTrpcInput, zDeleteStudentTrpcInput, zUpdateStudentTrpcInput } from './input'

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
export const updateStudentTrpcRoute = trpc.procedure
  .input(z.object({ id: z.string().uuid(), data: zUpdateStudentTrpcInput }))
  .mutation(async ({ input, ctx }) => {
    return await ctx.prisma.student.update({
      where: { id: input.id },
      data: input.data,
    })
  })

export const deleteStudentTrpcRoute = trpc.procedure
  .input(zDeleteStudentTrpcInput)
  .mutation(async ({ input, ctx }) => {
    // Проверяем, есть ли связанные сообщения
    const messages = await ctx.prisma.message.findMany({
      where: {
        OR: [
          { studentId: input.id },
          { recipientStudentId: input.id },
        ],
      },
    })
    
    if (messages.length > 0) {
      throw new Error('Невозможно удалить студента с привязанными сообщениями')
    }
    
    // Удаляем связанных бот-пользователей
    await ctx.prisma.botUser.deleteMany({
      where: { studentId: input.id },
    })
    
    return await ctx.prisma.student.delete({
      where: { id: input.id },
    })
  })
