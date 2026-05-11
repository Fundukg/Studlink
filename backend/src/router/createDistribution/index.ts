import { BotPlatform } from '@prisma/client'
import { sendToAnyPlatform } from '../../bot/utils'
import { trpc } from '../../lib/trpc'
import { zCreateDistributionTrpcInput } from './input'

export const createDistributionTrpcRoute = trpc.procedure
  .input(zCreateDistributionTrpcInput)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.me) {
      throw new Error('Необходима авторизация')
    }

    // 1. Поиск целевых студентов
    let students: { id: string; student_id: string }[] = []
    switch (input.targetType) {
      case 'STUDENT': {
        const s = await ctx.prisma.student.findUnique({
          where: { id: input.targetId },
          select: { id: true, student_id: true },
        })
        if (s) {
          students = [s]
        }
        break
      }
      case 'GROUP':
        students = await ctx.prisma.student.findMany({
          where: { groupId: input.targetId },
          select: { id: true, student_id: true },
        })
        break
      case 'COURSE':
        students = await ctx.prisma.student.findMany({
          where: { course: input.targetId! },
          select: { id: true, student_id: true },
        })
        break
      // ... остальные кейсы (Department, Faculty, All) работают так же
    }

    if (students.length === 0) {
      throw new Error('Получатели не найдены')
    }

    // 2. Создаем "шапку" рассылки
    const distribution = await ctx.prisma.distribution.create({
      data: {
        text: input.text,
        staffId: ctx.me.id,
        targetType: input.targetType,
        targetId:
          input.targetType !== 'ALL' && input.targetType !== 'COURSE'
            ? input.targetId
            : null,
        course:
          input.targetType === 'COURSE' ? parseInt(input.targetId!) : null,
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
