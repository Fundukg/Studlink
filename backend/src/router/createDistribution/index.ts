import { BotPlatform } from '@prisma/client'
import { sendToAnyPlatform } from '../../bot/utils'
import { trpc } from '../../lib/trpc'
import { zCreateDistributionTrpcInput } from './input'

export const createDistributionTrpcRoute = trpc.procedure
  .input(zCreateDistributionTrpcInput)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.me) {throw new Error('Необходима авторизация')}

    let students: { id: string; student_id: string }[] = []
    const { targetIds, targetType } = input

    // 1. Поиск студентов по массиву ID
    switch (targetType) {
      case 'STUDENT':
        students = await ctx.prisma.student.findMany({
          where: { id: { in: targetIds } },
          select: { id: true, student_id: true },
        })
        break
      case 'GROUP':
        students = await ctx.prisma.student.findMany({
          where: { groupId: { in: targetIds } },
          select: { id: true, student_id: true },
        })
        break
      case 'COURSE':
        // targetIds здесь — это ["1", "2"]
        students = await ctx.prisma.student.findMany({
          where: { course: { in: targetIds.map(String) } },
          select: { id: true, student_id: true },
        })
        break
      case 'DEPARTMENT':
        students = await ctx.prisma.student.findMany({
          where: { group: { departmentId: { in: targetIds } } },
          select: { id: true, student_id: true },
        })
        break
      case 'FACULTY':
        students = await ctx.prisma.student.findMany({
          where: { group: { department: { facultyId: { in: targetIds } } } },
          select: { id: true, student_id: true },
        })
        break
      case 'ALL':
        students = await ctx.prisma.student.findMany({
          select: { id: true, student_id: true },
        })
        break
    }

    if (students.length === 0) {throw new Error('Получатели не найдены')}

    // 2. Создаем запись о рассылке 
    // (targetId в базе обычно строка, можно сохранить первый ID или объединить их)
    const distribution = await ctx.prisma.distribution.create({
      data: {
        text: input.text,
        staffId: ctx.me.id,
        targetType: targetType,
        targetId: targetIds.length > 0 ? targetIds.join(',') : null,
        platform: input.platform as BotPlatform,
      },
    })

    let totalSuccessCount = 0
    const errorMessages = new Set<string>() // Собираем уникальные ошибки

    try {
      for (const student of students) {
        // Вызываем универсальную функцию (которая сама внутри разберется с ALL, если надо)
        const result = await sendToAnyPlatform(
          student.id,
          input.text,
          input.platform as BotPlatform
        )

        if (result.success) {
          totalSuccessCount++
          await ctx.prisma.message.create({
            data: {
              distributionId: distribution.id,
              text: input.text,
              senderType: 'STAFF',
              staffId: ctx.me.id,
              recipientStudentId: student.id,
              platform:
                input.platform === 'ALL'
                  ? 'TELEGRAM'
                  : (input.platform as BotPlatform),
              targetType: 'STUDENT',
            },
          })
        } else {
          errorMessages.add(result.error)
        }
      }

      // 3. Если ничего не ушло — чистим БД и выводим ВСЕ ошибки
      if (totalSuccessCount === 0) {
        await ctx.prisma.distribution.deleteMany({
          where: { id: distribution.id },
        })
        const finalError =
          Array.from(errorMessages).join('; ') || 'Неизвестная ошибка API'
        throw new Error(`Рассылка не удалась: ${finalError}`)
      }

      return { success: true, count: totalSuccessCount }
    } catch (error: any) {
      // Страховка: если упали посреди цикла, удаляем шапку только если нет сообщений
      await ctx.prisma.distribution
        .deleteMany({
          where: { id: distribution.id, messages: { none: {} } },
        })
        .catch(() => {})
      throw error
    }
  })
