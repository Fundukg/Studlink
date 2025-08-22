import { z } from 'zod'
import { trpc } from '../../lib/trpc'

export const getDialogueTrpcRoute = trpc.procedure
  .input(
    z.object({
      distributionId: z.string(), // ID рассылки
    })
  )
  .query(async ({ ctx, input }) => {
    // Находим рассылку по ID
    const distribution = await ctx.prisma.message.findUnique({
      where: {
        id: input.distributionId,
        parentId: null, // Убеждаемся, что это родительское сообщение (рассылка)
        senderType: 'STAFF', // Только сообщения от сотрудников
      },
      include: {
        // Информация об отправителе
        staff: {
          select: {
            id: true,
            nick: true,
          }
        },
        // Информация о получателях (в зависимости от типа)
        group: {
          select: {
            id: true,
            name: true,
            department: {
              select: {
                name: true,
                faculty: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        department: {
          select: {
            id: true,
            name: true,
            faculty: {
              select: {
                name: true
              }
            }
          }
        },
        faculty: {
          select: {
            id: true,
            name: true
          }
        },
        recipientStudent: {
          select: {
            id: true,
            name: true,
            student_id: true,
            group: {
              select: {
                name: true
              }
            }
          }
        },
        // Все ответы на это сообщение
        replies: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                student_id: true,
                group: {
                  select: {
                    name: true
                  }
                }
              }
            },
            staff: {
              select: {
                id: true,
                nick: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!distribution) {
      throw new Error('Диавалог не найден')
    }

    // Форматируем информацию о получателе
    // eslint-disable-next-line prefer-const
    let recipientInfo = {
      type: distribution.targetType,
      name: '',
      details: {} as any
    }

    switch (distribution.targetType) {
      case 'STUDENT':
        recipientInfo.name = distribution.recipientStudent?.name || 'Неизвестный студент';
        recipientInfo.details = {
          studentId: distribution.recipientStudent?.student_id,
          group: distribution.recipientStudent?.group?.name
        }
        break;
      case 'GROUP':
        recipientInfo.name = distribution.group?.name || 'Неизвестная группа';
        recipientInfo.details = {
          department: distribution.group?.department?.name,
          faculty: distribution.group?.department?.faculty?.name
        }
        break;
      case 'DEPARTMENT':
        recipientInfo.name = distribution.department?.name || 'Неизвестная кафедра';
        recipientInfo.details = {
          faculty: distribution.department?.faculty?.name
        }
        break;
      case 'FACULTY':
        recipientInfo.name = distribution.faculty?.name || 'Неизвестный факультет';
        break;
      case 'COURSE':
        recipientInfo.name = `Курс ${distribution.course}`;
        break;
      case 'ALL':
        recipientInfo.name = 'Все студенты';
        break;
    }

    // Форматируем ответы
    const formattedReplies = distribution.replies.map(reply => ({
      id: reply.id,
      text: reply.text,
      createdAt: reply.createdAt,
      sender: reply.student 
        ? { 
            type: 'STUDENT' as const, 
            id: reply.student.id, 
            name: reply.student.name,
            studentId: reply.student.student_id,
            group: reply.student.group?.name
          }
        : { 
            type: 'STAFF' as const, 
            id: reply.staff!.id, 
            name: reply.staff!.nick 
          }
    }))

    return {
      distribution: {
        id: distribution.id,
        text: distribution.text,
        createdAt: distribution.createdAt,
        sender: {
          id: distribution.staff?.id,
          name: distribution.staff?.nick
        },
        recipient: recipientInfo,
        replies: formattedReplies,
        repliesCount: distribution.replies.length
      }
    }
  })