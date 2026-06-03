// backend/src/router/dialogues/index.ts
import { UserRole } from '@prisma/client'
import { trpc } from '../../lib/trpc'
import { hasPermission, isDeanery, isTeacher } from '../../middleware/auth'

export const getDialoguesTrpcRoute = trpc.procedure
  .use(hasPermission('view:messages'))
  .query(async ({ ctx }) => {
    const me = ctx.me!

    // Определяем фильтр доступа для студентов
    let studentWhere: any = {}

    if (isDeanery(me.role)) {
      // Деканат видит только студентов своего факультета
      studentWhere = {
        studentProfile: {
          group: {
            department: {
              faculty: { deaneries: { some: { userId: me.id } } },
            },
          },
        },
      }
    } else if (isTeacher(me.role)) {
      // Преподаватель видит студентов только тех групп, к которым он привязан
      studentWhere = {
        studentProfile: {
          group: {
            teachers: { some: { teacherProfile: { userId: me.id } } },
          },
        },
      }
    }
    // Если ADMIN — оставляем пустой объект (видит всех)

    // Запрашиваем пользователей-студентов, у которых есть сообщения
    const students = await ctx.prisma.user.findMany({
      where: {
        role: UserRole.STUDENT,
        ...studentWhere,
        OR: [
          { sentMessages: { some: {} } },
          { receivedMessages: { some: {} } },
        ],
      },
      include: {
        studentProfile: { include: { group: true } },
        sentMessages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: true },
        },
        receivedMessages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: true },
        },
        _count: { select: { sentMessages: true, receivedMessages: true } },
      },
    })

    // Форматируем для фронтенда
    const formattedDialogues = students.map((s) => {
      // Берем последнее сообщение из двух массивов
      const sent = s.sentMessages[0]
      const received = s.receivedMessages[0]
      const lastMsg =
        sent?.createdAt > (received?.createdAt || 0) ? sent : received

      return {
        id: s.id,
        student: {
          name: `${s.firstName} ${s.lastName}`,
          studentId: s.studentProfile?.student_id,
        },
        lastMessage: {
          text: lastMsg?.text || '',
          senderType: lastMsg?.senderType,
          platform: lastMsg?.platform,
          senderName: lastMsg?.sender
            ? `${lastMsg.sender.firstName} ${lastMsg.sender.lastName}`
            : 'Студент',
          createdAt: lastMsg?.createdAt,
        },
        messageCount: s._count.sentMessages + s._count.receivedMessages,
        isLastFromDistribution: !!lastMsg?.distributionId,
      }
    })

    return {
      dialogues: formattedDialogues.sort(
        (a, b) =>
          (b.lastMessage.createdAt?.getTime() || 0) -
          (a.lastMessage.createdAt?.getTime() || 0)
      ),
    }
  })
