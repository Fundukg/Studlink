import { z } from 'zod'
import { trpc } from '../../lib/trpc'

export const getDialogueTrpcRoute = trpc.procedure
  .input(
    z.object({
      distributionId: z.string(), // ID родительского сообщения
    })
  )
  .query(async ({ ctx, input }) => {
    // Находим родительское сообщение
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
        student: {
          select: {
            id: true,
            name: true,
            student_id: true,
          },
        }
      },
    })

    if (!distribution) {
      throw new Error('Сообщение не найдено')
    }

    // Определяем, кто является участником диалога
    let studentId: string | null = null;
    let recipientName = '';

    if (distribution.recipientStudent) {
      // Сообщение отправлено сотрудником студенту
      studentId = distribution.recipientStudent.id;
      recipientName = `${distribution.recipientStudent.name} ${distribution.recipientStudent.student_id}`;
    } else if (distribution.student) {
      // Сообщение отправлено студентом
      studentId = distribution.student.id;
      recipientName = `${distribution.student.name} ${distribution.student.student_id}`;
    } else {
      throw new Error('Не удалось определить участника диалога');
    }

    // Находим все сообщения для этого студента
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
          // Также включаем родительское сообщение
          {
            id: input.distributionId,
          }
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
    const formattedMessages = allMessages.map((message) => {
      // Определяем отправителя
      let sender;
      if (message.staff) {
        sender = {
          type: 'STAFF' as const,
          id: message.staff.id,
          name: message.staff.nick,
        };
      } else if (message.student) {
        sender = {
          type: 'STUDENT' as const,
          id: message.student.id,
          name: message.student.name,
          studentId: message.student.student_id,
        };
      } else {
        // На случай, если отправитель не определен
        sender = {
          type: 'UNKNOWN' as const,
          id: 'unknown',
          name: 'Неизвестный отправитель',
        };
      }

      return {
        id: message.id,
        text: message.text,
        createdAt: message.createdAt,
        sender,
        isDistribution: message.id === input.distributionId,
      };
    });

    return {
      dialogue: {
        id: distribution.id,
        recipient: {
          name: recipientName,
          type: distribution.targetType,
        },
        messages: formattedMessages,
        createdAt: distribution.createdAt,
      },
    }
  })