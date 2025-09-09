import { trpc } from '../../lib/trpc'
import { zCreateDepartmentTrpcInput } from './input'

export const createDepartmentTrpcRoute = trpc.procedure.input(zCreateDepartmentTrpcInput).mutation(async ({ input, ctx }) => {
  if (!ctx.me) {
    throw Error('Unauthorized')
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
