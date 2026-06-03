// backend/src/router/createDirectMessage/index.ts
import { BotPlatform, SenderType } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { sendToAnyPlatform } from '../../bot/utils'
import { trpc } from '../../lib/trpc'
import { hasPermission } from '../../middleware/auth'
import { zCreateDirectMessageTrpcInput } from './input'

export const createDirectMessageTrpcRoute = trpc.procedure
  // 1. Проверяем цепочку мидлвар (сначала авторизация, затем пермишен)
  .use(hasPermission('send:direct-message'))
  // 2. Валидируем входящие данные от фронтенда
  .input(zCreateDirectMessageTrpcInput)
  // 3. Выполняем мутацию
  .mutation(async ({ input, ctx }) => {
    // Гарантировано мидлварой: ctx.me существует и обладает правами сотрудника/админа

    // 1. Отправка через универсальную утилиту ботов в Telegram/VK/OK
    const result = await sendToAnyPlatform(
      input.userId, // ID получателя (User.id)
      input.text,
      input.platform
    )

    // Если отправка не удалась на стороне соцсети — возвращаем tRPC ошибку
    if (!result.success) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Не удалось доставить сообщение через API платформы: ${result.error}`,
      })
    }

    // 2. Сохраняем в единую историю сообщений по обновленной и чистой схеме БД
    const message = await ctx.prisma.message.create({
      data: {
        text: input.text,

        // Роль отправителя динамически мапится из сессии (ADMIN, DEANERY, TEACHER)
        senderType: ctx.me.role as unknown as SenderType,
        senderId: ctx.me.id,

        // Идентификатор получателя (связь с таблицей User)
        recipientId: input.userId,

        // Мессенджер, куда ушло сообщение
        platform: input.platform as BotPlatform,
      },
    })

    return { success: true, messageId: message.id }
  })
