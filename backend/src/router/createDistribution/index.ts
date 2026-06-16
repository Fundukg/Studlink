// backend/src/router/createDistribution/index.ts
import { BotPlatform, SenderType, TargetType, UserRole } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { sendToAnyPlatform } from '../../bot/utils'
import { trpc } from '../../lib/trpc'
import { hasPermission } from '../../middleware/auth'
import { zCreateDistributionTrpcInput } from './input'

// Используем готовую процедуру с каскадной проверкой прав
const distributionProcedure = trpc.procedure.use(
  hasPermission('create:distribution')
)

export const createDistributionTrpcRoute = distributionProcedure
  .input(zCreateDistributionTrpcInput)
  .mutation(async ({ input, ctx }) => {
    // Гарантировано мидлварой: ctx.me существует и обладает правами (ADMIN/DEANERY)

    const { targetIds, targetType } = input

    // Сюда собираем базовые User.id подходящих студентов
    let recipients: { id: string }[] = []

    // 1. Поиск пользователей (студентов) по новой схеме связи через studentProfile
    switch (targetType) {
      case 'USER': // Конкретные User.id, переданные массивом
        recipients = await ctx.prisma.user.findMany({
          where: {
            id: { in: targetIds },
            role: UserRole.STUDENT,
          },
          select: { id: true },
        })
        break

      case 'GROUP':
        recipients = await ctx.prisma.user.findMany({
          where: {
            role: UserRole.STUDENT,
            studentProfile: { groupId: { in: targetIds } },
          },
          select: { id: true },
        })
        break

      case 'COURSE':
        recipients = await ctx.prisma.user.findMany({
          where: {
            role: UserRole.STUDENT,
            studentProfile: {
              course: { in: targetIds.map(Number) },
            },
          },
          select: { id: true },
        })
        break

      case 'DEPARTMENT':
        recipients = await ctx.prisma.user.findMany({
          where: {
            role: UserRole.STUDENT,
            studentProfile: {
              group: { departmentId: { in: targetIds } },
            },
          },
          select: { id: true },
        })
        break

      case 'FACULTY':
        recipients = await ctx.prisma.user.findMany({
          where: {
            role: UserRole.STUDENT,
            studentProfile: {
              group: {
                department: { facultyId: { in: targetIds } },
              },
            },
          },
          select: { id: true },
        })
        break

      case 'ALL':
        recipients = await ctx.prisma.user.findMany({
          where: { role: UserRole.STUDENT && UserRole.TEACHER },
          select: { id: true },
        })
        break
      case 'TEACHER':
        recipients = await ctx.prisma.user.findMany({
          where: {
            id: { in: targetIds },
            role: UserRole.TEACHER,
          },
          select: { id: true },
        })
        break

      default:
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Неподдерживаемый тип таргетинга: ${targetType}`,
        })
    }

    if (recipients.length === 0) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Получатели для данной рассылки не найдены в системе',
      })
    }

    // 2. Создаем "шапку" рассылки в таблице Distribution (здесь targetType НУЖЕН и ВАЖЕН)
    const distribution = await ctx.prisma.distribution.create({
      data: {
        text: input.text,
        senderId: ctx.me.id,
        targetType: targetType as TargetType,
        course: targetType === 'COURSE' ? Number(targetIds[0]) : null,
        targetId: targetIds.length > 0 ? targetIds.join(',') : null,
        platform: input.platform as BotPlatform,
      },
    })

    let totalSuccessCount = 0
    const errorMessages = new Set<string>() // Коллекция для уникальных ошибок апи мессенджеров

    try {
      // Итерируемся по всем найденным студентам и доставляем уведомления
      for (const recipient of recipients) {
        const result = await sendToAnyPlatform(
          recipient.id,
          input.text,
          input.platform as BotPlatform
        )
        
        if (result.success) {
          totalSuccessCount++

          // Создаем запись в Message.
          // Внимание: поля targetType здесь БОЛЬШЕ НЕТ, связь идет строго через recipientId и distributionId
          await ctx.prisma.message.create({
            data: {
              distributionId: distribution.id,
              text: input.text,
              senderType: ctx.me.role as unknown as SenderType, // Пишет ADMIN или DEANERY
              senderId: ctx.me.id,
              recipientId: recipient.id, // ID конкретного студента из таблицы User

              platform:
                input.platform === 'ALL'
                  ? BotPlatform.TELEGRAM // Фолбек для системного лога, если слали веером
                  : (input.platform as BotPlatform),
            },
          })
        } else {
          errorMessages.add(result.error || 'Unknown error')
        }
      }

      // 3. Если ни одно сообщение не ушло на серверы ботов — откатываем операцию
      if (totalSuccessCount === 0) {
        await ctx.prisma.distribution.delete({
          where: { id: distribution.id },
        })

        const finalError = Array.from(errorMessages).join('; ')
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Рассылка полностью отклонена платформами: ${finalError}`,
        })
      }

      return { success: true, count: totalSuccessCount }
    } catch (error: any) {
      // Страховочный блок на случай внезапного сбоя Node.js процесса в цикле
      if (distribution?.id) {
        await ctx.prisma.distribution
          .deleteMany({
            where: { id: distribution.id, messages: { none: {} } },
          })
          .catch(() => {})
      }

      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Критическая ошибка при выполнении рассылки',
      })
    }
  })
