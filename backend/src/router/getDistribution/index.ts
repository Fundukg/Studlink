import { z } from 'zod'
import { trpc } from '../../lib/trpc'

export const getDistributionTrpcRoute = trpc.procedure
  .input(
    z.object({
      distributionId: z.string(), // ID родительского сообщения (рассылки)
    })
  )
  .query(async ({ ctx, input }) => {
    // Находим родительское сообщение (рассылку)
    const distribution = await ctx.prisma.message.findUnique({
      where: {
        id: input.distributionId,
      },
      include: {
        staff: {
          select: {
            id: true,
            nick: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        faculty: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!distribution) {
      throw new Error('Рассылка не найдена')
    }

    // Определяем получателя рассылки
    let recipientName = ''
    switch (distribution.targetType) {
      case 'GROUP':
        recipientName = `Группа: ${distribution.group?.name || 'Неизвестная'}`
        break
      case 'DEPARTMENT':
        recipientName = `Кафедра: ${distribution.department?.name || 'Неизвестная'}`
        break
      case 'FACULTY':
        recipientName = `Факультет: ${distribution.faculty?.name || 'Неизвестный'}`
        break
      case 'COURSE':
        recipientName = `Курс: ${distribution.course}`
        break
      case 'ALL':
        recipientName = 'Все студенты'
        break
      default:
        recipientName = 'Неизвестный получатель'
    }

    // Находим все ответы на эту рассылку
    const replies = await ctx.prisma.message.findMany({
      where: {
        parentId: input.distributionId, // Ответы на эту рассылку
      },
      include: {
        staff: {
          select: {
            id: true,
            nick: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            student_id: true,
          },
        },
        // Информация о группе студента (для контекста)
        recipientStudent: {
          select: {
            id: true,
            name: true,
            student_id: true,
            group: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Сортируем по времени создания
      },
    })

    // Форматируем сообщения для отображения
    const formattedMessages = replies.map((message) => {
      // Определяем отправителя
      let sender
      if (message.staff) {
        sender = {
          type: 'STAFF' as const,
          id: message.staff.id,
          name: message.staff.nick,
        }
      } else if (message.student) { 
        sender = {
          type: 'STUDENT' as const,
          id: message.student.id,
          name: message.student.name,
          studentId: message.student.student_id,
          group: message.recipientStudent?.group?.name || null,
        }
      } else {
        // На случай, если отправитель не определен
        sender = {
          type: 'UNKNOWN' as const,
          id: 'unknown',
          name: 'Неизвестный отправитель',
        }
      }

      return {
        id: message.id,
        text: message.text,
        createdAt: message.createdAt,
        sender,
        isDistribution: false, // Это ответ, а не рассылка
      }
    })

    // Добавляем саму рассылку в начало списка сообщений
    const allMessages = [
      {
        id: distribution.id,
        text: distribution.text,
        createdAt: distribution.createdAt,
        sender: {
          type: 'STAFF' as const,
          id: distribution.staff?.id,
          name: distribution.staff?.nick,
        },
        isDistribution: true, // Это исходная рассылка
      },
      ...formattedMessages,
    ]

    return {
      distribution: {
        id: distribution.id,
        recipient: {
          name: recipientName,
          type: distribution.targetType,
        },
        messages: allMessages,
        createdAt: distribution.createdAt,
        sender: {
          id: distribution.staff?.id,
          name: distribution.staff?.nick,
        },
      },
    }
  })
