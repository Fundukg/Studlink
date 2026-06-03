import { UserRole } from "@prisma/client"
import { TRPCError } from "@trpc/server"
import { trpc } from "../../lib/trpc"
import { hasPermission } from "../../middleware/auth"
import { zCreateStudentTrpcInput } from "./input"

export const createStudentTrpcRoute = trpc.procedure
  .use(hasPermission('manage:students'))
  .input(zCreateStudentTrpcInput) // course больше не нужен во входных данных
  .mutation(async ({ input, ctx }) => {
    // 1. Проверяем зачетку
    const existingStudentProfile = await ctx.prisma.studentProfile.findUnique({
      where: { student_id: input.student_id },
    })
    if (existingStudentProfile) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Зачетка уже зарегистрирована',
      })
    }

    // 2. Ищем группу, чтобы получить её название и вычислить курс
    const targetGroup = await ctx.prisma.group.findUnique({
      where: { id: input.groupId },
    })
    if (!targetGroup) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Группа не найдена' })
    }

    // 3. Автоматическое вычисление курса (вторая цифра названия группы)
    const digits = targetGroup.name.replace(/\D/g, '')
    const autoCourse = digits.length >= 2 ? parseInt(digits[1]) : 1

    // 4. Создаем пользователя и профиль
    const newStudent = await ctx.prisma.user.create({
      data: {
        lastName: input.lastName,
        firstName: input.firstName,
        middleName: input.middleName || null,
        role: UserRole.STUDENT,
        studentProfile: {
          create: {
            student_id: input.student_id,
            course: autoCourse, // Автоматически вычисленный курс
            groupId: input.groupId,
            isLeader: input.isLeader || false,
          },
        },
      },
    })

    return { success: true, studentId: newStudent.id }
  })
