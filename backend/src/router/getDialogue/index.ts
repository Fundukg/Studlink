import { z } from 'zod'
import { trpc } from '../../lib/trpc'

export const getDialogueTrpcRoute = trpc.procedure
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
        recipientStudent: {
          select: {
            id: true,
            name: true,
            student_id: true,
          },
        },
      },
    })

    if (!distribution) {
      throw new Error('Диалог не найдена')
    }

    if (!distribution.recipientStudent) {
      throw new Error('Получатель не найден')
    }

    const studentId = distribution.recipientStudent.id

    // Находим ВСЕ сообщения для этого студента
    const allMessages = await ctx.prisma.message.findMany({
      where: {
        OR: [
          // Сообщения, отправленные этому студенту
          {
            recipientStudentId: studentId,
            senderType: 'STAFF',
          },

          // Сообщения, отправленные этим студентом
          {
            studentId: studentId,
            senderType: 'STUDENT',
          },
        ],
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
      },
      orderBy: {
        createdAt: 'asc', // Сортируем по времени создания
      },
    })

    // Форматируем сообщения для отображения
    const formattedMessages = allMessages.map((message) => ({
      id: message.id,
      text: message.text,
      createdAt: message.createdAt,
      sender: message.staff
        ? {
            type: 'STAFF' as const,
            id: message.staff.id,
            name: message.staff.nick,
          }
        : {
            type: 'STUDENT' as const,
            id: message.student!.id,
            name: message.student!.name,
            studentId: message.student!.student_id,
          },

      isDistribution: message.id === input.distributionId,
    }))

    return {
      dialogue: {
        id: distribution.id,
        recipient: {
          name: `Студент: ${distribution.recipientStudent.name} (${distribution.recipientStudent.student_id})`,
          type: distribution.targetType,
        },
        messages: formattedMessages,
        createdAt: distribution.createdAt,
      },
    }
  })
