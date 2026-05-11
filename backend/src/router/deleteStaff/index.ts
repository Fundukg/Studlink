import { trpc } from '../../lib/trpc'
import { isAdmin } from '../../utils/role'
import { zDeleteStaffTrpcInput } from './input'

// ПОЛУЧЕНИЕ СТАТИСТИКИ ПЕРЕД УДАЛЕНИЕМ
export const getStaffDeleteStats = trpc.procedure
  .input(zDeleteStaffTrpcInput)
  .query(async ({ input, ctx }) => {
    // Проверка прав администратора
    if (!isAdmin(ctx.me?.role)) {
      throw new Error('Недостаточно прав')
    }

    const stats = await ctx.prisma.staff.findUnique({
      where: { id: input.id },
      select: {
        _count: {
          select: {
            sentMessages: true,     // Сколько сообщений отправил
            receivedMessages: true, // Сколько сообщений получил
          },
        },
      },
    })

    if (!stats) {
      throw new Error('Сотрудник не найден')
    }

    return stats._count
  })

// УДАЛЕНИЕ СОТРУДНИКА
export const deleteStaffTrpcRoute = trpc.procedure
  .input(zDeleteStaffTrpcInput)
  .mutation(async ({ input, ctx }) => {
    // 1. Проверка прав
    if (!isAdmin(ctx.me?.role)) {
      throw new Error('Недостаточно прав')
    }

    // 2. Защита от самоудаления
    if (ctx.me?.id === input.id) {
      throw new Error('Вы не можете удалить свою собственную учетную запись')
    }

    // 3. Проверка существования
    const targetStaff = await ctx.prisma.staff.findUnique({
      where: { id: input.id }
    })
    
    if (!targetStaff) {
      throw new Error('Сотрудник не найден')
    }

    // 4. Удаление в транзакции
    // Если в Prisma Schema не стоит onDelete: Cascade на сообщениях, 
    // их нужно удалить или отвязать вручную здесь.
    return await ctx.prisma.$transaction(async (tx) => {
      // Удаляем или анонимизируем отправленные сообщения (зависит от задачи)
      await tx.message.deleteMany({
        where: { staffId: input.id }
      })

      // Удаляем самого сотрудника
      await tx.staff.delete({
        where: { id: input.id },
      })

      return true
    })
  })