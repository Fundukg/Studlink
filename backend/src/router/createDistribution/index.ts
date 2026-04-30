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

    // 1. Получаем список студентов в зависимости от типа цели
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
      case 'DEPARTMENT':
        students = await ctx.prisma.student.findMany({
          where: { group: { departmentId: input.targetId } },
          select: { id: true, student_id: true },
        })
        break
      case 'FACULTY':
        students = await ctx.prisma.student.findMany({
          where: { group: { department: { facultyId: input.targetId } } },
          select: { id: true, student_id: true },
        })
        break
      case 'ALL':
        students = await ctx.prisma.student.findMany({ select: { id: true, student_id: true } })
        break
    }

    if (students.length === 0) {
      throw new Error('Получатели не найдены')
    }

    // 2. Определяем, на какие платформы отправлять
    const platformsToSend: BotPlatform[] =
      input.platform === 'ALL'
        ? [BotPlatform.TELEGRAM, BotPlatform.VK, BotPlatform.OK]
        : [input.platform as BotPlatform]

    // 3. Получаем ID ботов из БД для записи в Message (нужны UUID записей)
    const activeBots = await ctx.prisma.bot.findMany({
      where: { platform: { in: platformsToSend } },
    })

    let totalSuccessCount = 0
    const errors: string[] = []

    // Проходим по всем найденным студентам
    for (const student of students) {
      let isSentToAtLeastOne = false
      const sentPlatforms: BotPlatform[] = []
      // console.log(sentPlatforms)
      // Проходим по активным ботам (ТГ, ВК и т.д.), полученным из БД [cite: 111, 113]
      for (const bot of activeBots) {
        try {
          // Вызываем нашу универсальную утилиту
          const result = await sendToAnyPlatform(student.id, input.text, bot.platform)
          // console.log(result)
          if (result.success) {
            isSentToAtLeastOne = true
            sentPlatforms.push(bot.platform)
            // console.log('🚀 ~ result:', result,sentPlatforms )
          }
        } catch (e: any) {
          errors.push(`Student ${student.student_id} (${bot.platform}): ${e.message}`)
        }
      }

      if (isSentToAtLeastOne) {
        totalSuccessCount++
        // Создаем запись в истории для каждого успешного мессенджера
        const finalPlatforms = sentPlatforms.length > 1 ? BotPlatform.ALL : sentPlatforms[0]
        const finalBotId = sentPlatforms.length > 1 ? null : activeBots.find((b) => b.platform === sentPlatforms[0])?.id
        await ctx.prisma.message.create({
          data: {
            text: input.text,
            senderType: 'STAFF',
            staffId: ctx.me.id,
            targetType: input.targetType,
            botId: finalBotId,
            platform: finalPlatforms,
            recipientStudentId: student.id,
            ...(input.targetType === 'GROUP' && { groupId: input.targetId }),
            ...(input.targetType === 'DEPARTMENT' && { departmentId: input.targetId }),
            ...(input.targetType === 'FACULTY' && { facultyId: input.targetId }),
            ...(input.targetType === 'COURSE' && { course: parseInt(input.targetId!) }),
          },
        })
      }
    }

    if (totalSuccessCount === 0) {
      throw new Error(`Ни одного сообщения не отправлено. Ошибки: `) //${result.error}
    }

    return { success: true, count: totalSuccessCount }
  })
