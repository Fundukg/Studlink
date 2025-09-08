import { trpc } from '../../lib/trpc'
import { zCreateFacultyTrpcInput } from './input'

export const createFacultyTrpcRoute = trpc.procedure.input(zCreateFacultyTrpcInput).mutation(async ({ input, ctx }) => {
  if (!ctx.me) {
    throw Error('Unauthorized')
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
