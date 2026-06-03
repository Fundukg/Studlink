// backend/src/router/staff/update.ts
import { UserRole } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { trpc } from '../../lib/trpc'
import { hasPermission } from '../../middleware/auth'
import { zDeaneryUpdateTrpcInput } from './input'

export const updateDeaneryTrpcRoute = trpc.procedure
  .use(hasPermission('manage:staff'))
  .input(zDeaneryUpdateTrpcInput)
  .mutation(async ({ input, ctx }) => {
    // 1. Проверяем существование пользователя
    const user = await ctx.prisma.user.findUnique({
      where: { id: input.id },
      include: { deaneryProfile: true },
    })

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Пользователь не найден',
      })
    }

    // 2. Выполняем обновление через транзакцию
    return await ctx.prisma.$transaction(async (tx) => {
      // Обновляем основные данные пользователя
      const updatedUser = await tx.user.update({
        where: { id: input.id },
        data: {
          nick: input.nick,
          firstName: input.firstName,
          lastName: input.lastName,
          middleName: input.middleName,
          role: input.role as UserRole,
        },
      })

      // Если роль стала DEANERY, управляем профилем деканата
      if (input.role === UserRole.DEANERY && input.facultyId) {
        await tx.deaneryProfile.upsert({
          where: { userId: input.id },
          update: { facultyId: input.facultyId },
          create: {
            userId: input.id,
            facultyId: input.facultyId,
          },
        })
      } else if (input.role !== UserRole.DEANERY && user.deaneryProfile) {
        // Если роль сменили с деканата на другую, удаляем профиль
        await tx.deaneryProfile.delete({
          where: { userId: input.id },
        })
      }

      return updatedUser
    })
  })
