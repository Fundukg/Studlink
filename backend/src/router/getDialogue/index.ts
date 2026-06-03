// backend/src/router/getDialogue/index.ts
import { UserRole } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { trpc } from '../../lib/trpc'
import { hasPermission, isDeanery, isTeacher  } from '../../middleware/auth'

export const getDialogueTrpcRoute = trpc.procedure
  .use(hasPermission('view:messages'))
  .input(z.object({ studentId: z.string() }))
  .query(async ({ ctx, input }) => {
    const me = ctx.me!

    // 1. Получаем данные студента с иерархией факультета
    const student = await ctx.prisma.user.findUnique({
      where: { id: input.studentId },
      include: {
        studentProfile: {
          include: {
            group: { include: { department: { include: { faculty: true } } } },
          },
        },
      },
    })

    if (!student || student.role !== UserRole.STUDENT) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Студент не найден' })
    }

    // 2. ПРОВЕРКА ПРАВ
    if (isDeanery(me.role)) {
      const deanery = await ctx.prisma.deaneryProfile.findUnique({
        where: { userId: me.id },
      })
      if (
        !deanery ||
        deanery.facultyId !==
          student.studentProfile?.group?.department.facultyId
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Нет доступа к студентам этого факультета',
        })
      }
    }

    // 3. Получаем сообщения с фильтрацией по роли
    const allMessages = await ctx.prisma.message.findMany({
      where: {
        OR: [{ senderId: input.studentId }, { recipientId: input.studentId }],
        // Фильтр для учителя: он видит только те диалоги, где ОН является участником (отправитель или получатель)
        ...(isTeacher(me.role)
          ? {
              OR: [
                { senderId: me.id, recipientId: input.studentId },
                { senderId: input.studentId, recipientId: me.id },
              ],
            }
          : {}),
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // 4. Форматирование
    const formattedMessages = allMessages.map((m) => ({
      id: m.id,
      text: m.text,
      createdAt: m.createdAt,
      platform: m.platform,
      isDistribution: !!m.distributionId,
      sender: {
        id: m.senderId,
        name: m.sender
          ? `${m.sender.firstName} ${m.sender.lastName}`
          : 'Система',
        role: m.senderType,
      },
    }))

    return {
      dialogue: {
        recipient: {
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
        },
        messages: formattedMessages,
      },
    }
  })
