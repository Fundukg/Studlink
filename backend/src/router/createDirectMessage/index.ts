import { sendToAnyPlatform } from '../../bot/utils'
import { trpc } from '../../lib/trpc'
import { zCreateDirectMessageTrpcInput } from './input'

export const createDirectMessageTrpcRoute = trpc.procedure
  .input(zCreateDirectMessageTrpcInput)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.me) {throw new Error('Необходима авторизация')}

    // 1. Отправка через бота
    const result = await sendToAnyPlatform(input.studentId, input.text, input.platform)
    
    if (!result.success) {
      throw new Error('Не удалось отправить сообщение')
    }

    // 2. Сохраняем в историю как одиночное сообщение
    const message = await ctx.prisma.message.create({
      data: {
        text: input.text,
        senderType: 'STAFF',
        staffId: ctx.me.id,
        recipientStudentId: input.studentId,
        platform: input.platform,
        targetType: 'STUDENT',
        // distributionId остается null
      },
    })

    return { success: true, messageId: message.id }
  })