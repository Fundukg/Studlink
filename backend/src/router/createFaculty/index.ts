import { trpc } from '../../lib/trpc'
import { isAdmin, isDeanery } from '../../utils/role'
import { zCreateFacultyTrpcInput } from './input'

export const createFacultyTrpcRoute = trpc.procedure
  .input(zCreateFacultyTrpcInput)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.me) {
      throw Error('Unauthorized')
    }
    if (!isAdmin(ctx.me?.role) && !isDeanery(ctx.me?.role)) {
      throw new Error('Доступ запрещен: недостаточно прав')
    }
    const exFaculty = await ctx.prisma.faculty.findUnique({
      where: {
        name: input.name,
      },
    })
    if (exFaculty) {
      throw Error('Такой факультет уже зарегистрирован')
    }
    await ctx.prisma.faculty.create({
      data: {
        name: input.name,
      },
    })
    return true
  })
