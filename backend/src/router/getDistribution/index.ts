import { z } from 'zod'
import { trpc } from '../../lib/trpc'

export const getDistributionTrpcRoute = trpc.procedure
  .input(
    z.object({
      distributionId: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    // 1. Получаем основную информацию о рассылке
    const distribution = await ctx.prisma.distribution.findUnique({
      where: { id: input.distributionId },
      include: {
        staff: {
          select: { id: true, nick: true, lastName: true, firstName: true },
        },
      },
    })

    if (!distribution) {
      throw new Error('Рассылка не была найдена')
    }

    // Извлекаем массив ID (предполагаем, что они хранятся через запятую или как массив в JSON/String)
    // Если у тебя в БД targetId это строка "id1,id2", превращаем в массив
    const targetIds = distribution.targetId
      ? distribution.targetId.split(',').filter(Boolean)
      : []

    let targetDetails: { id: string; name: string }[] = []

    // 2. Логика получения понятных названий для разных типов целей
    switch (distribution.targetType) {
      case 'GROUP':
        { const groups = await ctx.prisma.group.findMany({
          where: { id: { in: targetIds } },
          select: { id: true, name: true },
        })
        targetDetails = groups
        break }

      case 'DEPARTMENT':
        { const depts = await ctx.prisma.department.findMany({
          where: { id: { in: targetIds } },
          select: { id: true, name: true },
        })
        targetDetails = depts
        break }

      case 'FACULTY':
        { const faculties = await ctx.prisma.faculty.findMany({
          where: { id: { in: targetIds } },
          select: { id: true, name: true },
        })
        targetDetails = faculties
        break }

      case 'STUDENT':
        { const students = await ctx.prisma.student.findMany({
          where: { id: { in: targetIds } },
          select: { id: true, name: true },
        })
        targetDetails = students
        break }

      case 'COURSE':
        // Для курсов просто выводим цифры, так как у них нет отдельных имен в БД
        targetDetails = targetIds.map((c) => ({ id: c, name: `${c} курс` }))
        break

      case 'ALL':
        targetDetails = [{ id: 'all', name: 'Все пользователи' }]
        break
    }

    // 3. Считаем реальную статистику по сообщениям
    const totalMessages = await ctx.prisma.message.count({
      where: { distributionId: distribution.id },
    })

    // 4. Формируем финальный объект
    return {
      id: distribution.id,
      text: distribution.text,
      createdAt: distribution.createdAt,
      platform: distribution.platform,
      targetType: distribution.targetType,

      // Массив объектов с именами и ID (например, список выбранных групп)
      targets: targetDetails,

      sender: {
        id: distribution.staff?.id,
        nick: distribution.staff?.nick,
        fullName: distribution.staff
          ? `${distribution.staff.lastName} ${distribution.staff.firstName}`.trim()
          : 'Система',
      },

      stats: {
        totalSent: totalMessages,
      },
    }
  })
