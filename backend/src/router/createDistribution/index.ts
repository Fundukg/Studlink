import { trpc } from '../../lib/trpc'
import { zCreateDistributionTrpcInput } from './input'

export const createDistributionTrpcRoute = trpc.procedure
  .input(zCreateDistributionTrpcInput)
  .mutation(async ({ input, ctx }) => {
    // 1. Проверка авторизации
    if (!ctx.me) {
      throw new Error('Необходима авторизация')
    }

    // 2. Создаем сообщение в базе данных
    await ctx.prisma.message.create({
      data: {
        text: input.text, // Текст сообщения
        senderType: 'STAFF', // Тип отправителя (сотрудник)
        staffId: ctx.me.id, // ID сотрудника
        targetType: input.targetType, // Тип получателя


        // 3. Заполняем поле в зависимости от типа получателя
        ...(input.targetType === 'STUDENT' && { recipientStudentId: input.targetId }),
        ...(input.targetType === 'GROUP' && { groupId: input.targetId }),
        ...(input.targetType === 'DEPARTMENT' && { departmentId: input.targetId }),
        ...(input.targetType === 'FACULTY' && { facultyId: input.targetId }),
      },
    })

    // 4. Возвращаем успешный результат
    return true
  })
