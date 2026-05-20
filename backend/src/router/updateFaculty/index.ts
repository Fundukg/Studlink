import { trpc } from '../../lib/trpc'
import { isAdmin, isDeanery } from '../../utils/role'
import { zUpdateFacultyTrpcInput } from './input'

export const updateFacultyTrpcRoute = trpc.procedure
  .input(zUpdateFacultyTrpcInput)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.me) {
      throw Error('Unauthorized')
    }
    if (!isAdmin(ctx.me?.role)  && !isDeanery(ctx.me?.role)) {
        throw new Error('Доступ запрещен: недостаточно прав')
      }
    const faculty = await ctx.prisma.faculty.findUnique({
      where: { id: input.id },
    })
    if (!faculty) {
      throw Error('Факультет не найден')
    }

    // Проверка на дубликат имени (если имя меняется)
    if (input.name !== faculty.name) {
      const exists = await ctx.prisma.faculty.findUnique({
        where: { name: input.name },
      })
      if (exists) {
        throw Error('Факультет с таким именем уже существует')
      }
    }

    return await ctx.prisma.faculty.update({
      where: { id: input.id },
      data: { name: input.name },
    })
  })
