import { trpc } from '../../lib/trpc'
import { isAdmin, isDeanery } from '../../utils/role'
import { zCreateDepartmentTrpcInput } from './input'

export const createDepartmentTrpcRoute = trpc.procedure
  .input(zCreateDepartmentTrpcInput)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.me) {
      throw Error('Unauthorized')
    }
    if (!isAdmin(ctx.me?.role)  && !isDeanery(ctx.me?.role)) {
        throw new Error('Доступ запрещен: недостаточно прав')
      }
    const exDepartment = await ctx.prisma.department.findUnique({
      where: {
        name: input.name,
      },
    })
    if (exDepartment) {
      throw Error('Такая кафедра уже зарегистрирована')
    }
    await ctx.prisma.department.create({
      data: {
        name: input.name,
        facultyId: input.facultyId,
      },
    })
    return true
  })
