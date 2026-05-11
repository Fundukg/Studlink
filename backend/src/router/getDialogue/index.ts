import { z } from 'zod'
import { trpc } from '../../lib/trpc'

export const getDialogueTrpcRoute = trpc.procedure
  .input(
    z.object({
      studentId: z.string(), // Теперь запрашиваем диалог по ID студента
    })
  )
  .query(async ({ ctx, input }) => {
    // 1. Получаем данные студента для заголовка чата
    const student = await ctx.prisma.student.findUnique({
      where: { id: input.studentId },
      select: { id: true, name: true, student_id: true },
    })

    if (!student) {
      throw new Error('Студент не найден')
    }

    // 2. Получаем все сообщения:
    // - Где студент является отправителем (STUDENT -> STAFF)
    // - Где студент является получателем (STAFF -> STUDENT), включая рассылки
    const allMessages = await ctx.prisma.message.findMany({
      where: {
        OR: [
          { studentId: input.studentId },          // Сообщения ОТ студента
          { recipientStudentId: input.studentId }, // Сообщения К студенту (личные и рассылки)
        ],
      },
      include: {
        staff: { select: { id: true, nick: true } },
        student: { select: { id: true, name: true, student_id: true } },
        distribution: { select: { id: true } }, // Чтобы пометить, что это было частью рассылки
      },
      orderBy: { createdAt: 'asc' },
    })

    const formattedMessages = allMessages.map((message) => {
      let sender
      if (message.senderType === 'STAFF') {
        sender = {
          type: 'STAFF' as const,
          id: message.staffId || 'system',
          name: message.staff?.nick || 'Сотрудник',
        }
      } else {
        sender = {
          type: 'STUDENT' as const,
          id: student.id,
          name: student.name,
          studentId: student.student_id,
        }
      }

      return {
        id: message.id,
        text: message.text,
        createdAt: message.createdAt,
        sender,
        platform: message.platform,
        // Помечаем сообщение, если оно пришло из массовой рассылки
        isDistribution: !!message.distributionId, 
      }
    })

    return {
      dialogue: {
        recipient: {
          id: student.id,
          name: student.name,
          studentId: student.student_id,
        },
        messages: formattedMessages,
      },
    }
  })