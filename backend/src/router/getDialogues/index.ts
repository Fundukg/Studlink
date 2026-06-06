// backend/src/router/dialogues/index.ts
import { UserRole } from '@prisma/client'
import { trpc } from '../../lib/trpc'
import { hasPermission, isDeanery, isTeacher } from '../../middleware/auth'

export const getDialoguesTrpcRoute = trpc.procedure
  .use(hasPermission('view:messages'))
  .query(async ({ ctx }) => {
    const me = ctx.me!

    // ================== ПРЕПОДАВАТЕЛЬ ==================
    if (isTeacher(me.role)) {
      // Ищем студентов, с которыми у преподавателя есть переписка
      const students = await ctx.prisma.user.findMany({
        where: {
          role: UserRole.STUDENT,
          OR: [
            { receivedMessages: { some: { senderId: me.id } } }, // я отправил студенту
            { sentMessages: { some: { recipientId: me.id } } }, // студент отправил мне
          ],
        },
        include: {
          studentProfile: { include: { group: true } },
          // Берём только последнее сообщение В ДИАЛОГЕ С ДАННЫМ ПРЕПОДАВАТЕЛЕМ
          sentMessages: {
            where: { recipientId: me.id }, // сообщения студент -> преп
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { sender: true },
          },
          receivedMessages: {
            where: { senderId: me.id }, // сообщения преп -> студент
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { sender: true },
          },
          _count: {
            select: {
              sentMessages: { where: { recipientId: me.id } },
              receivedMessages: { where: { senderId: me.id } },
            },
          },
        },
      })

      const formattedDialogues = students.map((s) => {
        const sent = s.sentMessages[0]
        const received = s.receivedMessages[0]

        // Определяем последнее сообщение в диалоге
        const lastMsg = !sent
          ? received
          : !received
            ? sent
            : sent.createdAt > received.createdAt
              ? sent
              : received

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
          messageCount:
            (s._count?.sentMessages ?? 0) + (s._count?.receivedMessages ?? 0),
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
    }

    // ================== ДЕКАНАТ И АДМИН ==================
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
    }
    // Администратор видит всех (studentWhere остаётся пустым)

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

    const formattedDialogues = students.map((s) => {
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
