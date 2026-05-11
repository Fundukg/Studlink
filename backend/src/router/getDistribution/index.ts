import { z } from 'zod'
import { trpc } from '../../lib/trpc'

export const getDistributionTrpcRoute = trpc.procedure
  .input(
    z.object({
      distributionId: z.string(), // ID из таблицы Distribution
    })
  )
  .query(async ({ ctx, input }) => {
    // 1. Находим саму рассылку в новой таблице
    const distribution = await ctx.prisma.distribution.findUnique({
      where: { id: input.distributionId },
      include: {
        staff: { select: { id: true, nick: true } },
        // Подгружаем сообщения, чтобы увидеть детализацию (опционально)
        messages: {
          include: {
            recipientStudent: {
              select: { name: true, student_id: true }
            }
          },
          take: 5 // Можно взять несколько для превью или убрать, если не нужно
        }
      },
    })

    if (!distribution) {
      throw new Error('Рассылка не найдена')
    }

    // 2. Формируем имя получателя (таргетинг)
    let recipientName = ''
    switch (distribution.targetType) {
      case 'GROUP':
        // Здесь можно сделать доп. запрос к Group, если в Distribution только targetId
        recipientName = `Группа (ID: ${distribution.targetId})`
        break
      case 'DEPARTMENT':
        recipientName = `Кафедра (ID: ${distribution.targetId})`
        break
      case 'FACULTY':
        recipientName = `Факультет (ID: ${distribution.targetId})`
        break
      case 'COURSE':
        recipientName = `${distribution.course} курс`
        break
      case 'ALL':
        recipientName = 'Все студенты'
        break
      default:
        recipientName = 'Личная рассылка'
    }

    // 3. Возвращаем данные для отображения "карточки" рассылки
    return {
      distribution: {
        id: distribution.id,
        text: distribution.text,
        createdAt: distribution.createdAt,
        platform: distribution.platform,
        targetType: distribution.targetType,
        recipient: {
          name: recipientName,
        },
        sender: {
          id: distribution.staff?.id,
          name: distribution.staff?.nick || 'Система',
        },
        // Статистика: сколько сообщений было создано в рамках этой рассылки
        stats: {
          totalSent: distribution.messages.length,
        }
      },
    }
  })