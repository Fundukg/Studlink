import { trpc } from '../../lib/trpc'

export const getDialoguesTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  // Получаем все сообщения, которые являются частью диалогов со студентами
  const studentMessages = await ctx.prisma.message.findMany({
    where: {
      OR: [
        {
          // Сообщения, отправленные конкретным студентам
          recipientStudentId: { not: null },
          senderType: 'STAFF',
        },
        {
          // Сообщения, отправленные от студентов
          studentId: { not: null },
          senderType: 'STUDENT',
        },
      ],
    },
    select: {
      id: true,
      text: true,
      createdAt: true,
      senderType: true,
      // Информация о студенте (как получателе)
      recipientStudent: {
        select: {
          id: true,
          name: true,
          student_id: true,
        },
      },
      // Информация о студенте (как отправителе)
      student: {
        select: {
          id: true,
          name: true,
          student_id: true,
        },
      },
      // Информация о сотруднике (отправителе)
      staff: {
        select: {
          id: true,
          nick: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc', // Сначала новые сообщения
    },
  })

  // Группируем сообщения по студентам
  const dialoguesByStudent = new Map()

  for (const message of studentMessages) {
    // Определяем ID студента для группировки
    let studentId: string | null = null
    let studentInfo: any = null

    if (message.recipientStudent) {
      // Сообщение отправлено студенту
      studentId = message.recipientStudent.id
      studentInfo = message.recipientStudent
    } else if (message.student) {
      // Сообщение отправлено от студента
      studentId = message.student.id
      studentInfo = message.student
    }

    if (!studentId) {
      continue
    }

    // Получаем или создаем диалог для этого студента
    if (!dialoguesByStudent.has(studentId)) {
      dialoguesByStudent.set(studentId, {
        student: studentInfo,
        messages: [],
        lastMessageAt: message.createdAt,
      })
    }

    const dialogue = dialoguesByStudent.get(studentId)
    dialogue.messages.push(message)

    // Обновляем время последнего сообщения, если текущее сообщение новее
    if (message.createdAt > dialogue.lastMessageAt) {
      dialogue.lastMessageAt = message.createdAt
    }
  }
  // Преобразуем Map в массив и форматируем данные
  const formattedDialogues = Array.from(dialoguesByStudent.values()).map((dialogue) => {
    // Сортируем сообщения по дате (сначала новые)
    const sortedMessages = dialogue.messages.sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Берем последнее сообщение для превью
    const lastMessage = sortedMessages[0]
    const distributionId = dialogue.originalDistribution ? dialogue.originalDistribution.id : lastMessage.id
    return {
      id: distributionId,
      student: {
        name: dialogue.student.name,
        studentId: dialogue.student.student_id,
      },
      lastMessage: {
        text: lastMessage.text,
        senderType: lastMessage.senderType,
        senderName: lastMessage.senderType === 'STAFF' ? lastMessage.staff?.name : lastMessage.student?.name,
        createdAt: lastMessage.createdAt,
      },
      messageCount: dialogue.messages.length,
      lastActivity: dialogue.lastMessageAt,
    }
  })

  // Сортируем диалоги по времени последней активности (сначала новые)
  formattedDialogues.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())

  return { distributions: formattedDialogues }
})
