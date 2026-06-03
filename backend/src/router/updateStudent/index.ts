// backend/src/router/student/update.ts
import { TRPCError } from '@trpc/server'
import { trpc } from '../../lib/trpc'
import { hasPermission } from '../../middleware/auth'
import { zUpdateStudentTrpcInput } from './input'

export const updateStudentTrpcRoute = trpc.procedure
  .use(hasPermission('manage:students')) // Право на редактирование студентов
  .input(zUpdateStudentTrpcInput)
  .mutation(async ({ input, ctx }) => {
    // 1. Проверяем существование студента
    const student = await ctx.prisma.user.findUnique({
      where: { id: input.id, role: 'STUDENT' },
      include: { studentProfile: true },
    })

    if (!student) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Студент не найден' })
    }

    // 2. Валидация уникальности зачетки (student_id)
    if (
      input.student_id &&
      input.student_id !== student.studentProfile?.student_id
    ) {
      const exists = await ctx.prisma.studentProfile.findUnique({
        where: { student_id: input.student_id },
      })
      if (exists) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Студент с такой зачеткой уже существует',
        })
      }
    }
    const targetGroup = await ctx.prisma.group.findUnique({
      where: { id: input.groupId },
    })
    if (!targetGroup) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Группа не найдена' })
    }
    const digits = targetGroup.name.replace(/\D/g, '')
    const autoCourse = digits.length >= 2 ? parseInt(digits[1]) : 1
    // 3. Обновление через транзакцию
    return await ctx.prisma.$transaction(async (tx) => {
      // Обновляем базовую информацию
      const updatedUser = await tx.user.update({
        where: { id: input.id },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          middleName: input.middleName,
        },
      })

      // Обновляем учебный профиль
      await tx.studentProfile.update({
        where: { userId: input.id },
        data: {
          student_id: input.student_id,
          groupId: input.groupId,
          course: autoCourse,
        },
      })

      return updatedUser
    })
  })
