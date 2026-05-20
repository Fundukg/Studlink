import { trpc } from '../../lib/trpc'
import { isAdmin, isDeanery } from '../../utils/role'
import { zCreateGroupTrpcInput } from './input'

export const createGroupTrpcRoute = trpc.procedure
  .input(zCreateGroupTrpcInput)
  .mutation(async ({ input, ctx }) => {
    // Логика: берем второй символ (индекс 1) и превращаем в число
    if (!ctx.me) {
      throw Error('Unauthorized')
    }
    if (!isAdmin(ctx.me?.role)  && !isDeanery(ctx.me?.role)) {
        throw new Error('Доступ запрещен: недостаточно прав')
      }
    const extractedCourse = input.name.charAt(1)
    if (!extractedCourse) {
      throw new Error(
        'Не удалось определить курс из названия группы (второй символ должен быть цифрой)'
      )
    }
    return await ctx.prisma.group.create({
      data: {
        name: input.name,
        departmentId: input.departmentId,
        course: extractedCourse, // Автоматически сохраняем
      },
    })
  })
