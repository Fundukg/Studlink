import { trpc } from '../../lib/trpc'

export const getDialoguesTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  // 1. Получаем сообщения
  const allMessages = await ctx.prisma.message.findMany({
    where: {
      OR: [
        { recipientStudentId: { not: null } },
        { studentId: { not: null } },
      ],
    },
    include: {
      recipientStudent: {
        select: { id: true, name: true, student_id: true },
      },
      student: {
        select: { id: true, name: true, student_id: true },
      },
      staff: {
        select: { nick: true },
      },
      // Убедитесь, что в схеме Prisma поле называется platform
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  const dialoguesMap = new Map<string, any>()

  for (const msg of allMessages) {
    const studentInfo = msg.recipientStudent || msg.student
    if (!studentInfo) {continue}

    const studentId = studentInfo.id

    if (!dialoguesMap.has(studentId)) {
      dialoguesMap.set(studentId, {
        student: {
          id: studentId,
          name: studentInfo.name,
          student_id: studentInfo.student_id,
        },
        lastMessage: msg,
        count: 0,
      })
    }
    dialoguesMap.get(studentId).count++
  }

  const formattedDialogues = Array.from(dialoguesMap.values()).map((item) => {
    const lastMsg = item.lastMessage
    return {
      id: item.student.id,
      student: {
        name: item.student.name,
        studentId: item.student.student_id,
      },
      lastMessage: {
        text: lastMsg.text,
        senderType: lastMsg.senderType,
        // Исправлена опечатка: platform вместо palatform
        platform: lastMsg.platform,
        senderName:
          lastMsg.senderType === 'STAFF'
            ? lastMsg.staff?.nick || 'Сотрудник'
            : item.student.name,
        createdAt: lastMsg.createdAt,
      },
      messageCount: item.count,
      isLastFromDistribution: !!lastMsg.distributionId,
    }
  })

  return {
    dialogues: formattedDialogues.sort(
      (a, b) =>
        b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
    ),
  }
})
