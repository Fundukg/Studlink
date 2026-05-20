import { trpc } from '../../lib/trpc'
import { isAdmin, isDeanery } from '../../utils/role'
import { zUpdateGroupTrpcInput } from './input'

export const updateGroupTrpcRoute = trpc.procedure
  .input(zUpdateGroupTrpcInput)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.me) {
      throw Error('Unauthorized')
    }
    if (!isAdmin(ctx.me?.role) && !isDeanery(ctx.me?.role)) {
          throw new Error('Доступ запрещен: недостаточно прав')
        }
    const group = await ctx.prisma.group.findUnique({
      where: { id: input.id },
    })
    if (!group) {
      throw Error('Группа не найдена')
    }

    // Проверка на уникальность имени, если оно меняется
    if (input.name !== group.name) {
      const exists = await ctx.prisma.group.findUnique({
        where: { name: input.name },
      })
      if (exists) {
        throw Error('Группа с таким названием уже существует')
      }
    }

    return await ctx.prisma.group.update({
      where: { id: input.id },
      data: {
        name: input.name,
        departmentId: input.departmentId,
      },
    })
  })
