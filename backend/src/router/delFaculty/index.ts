import { trpc } from '../../lib/trpc'
import { zDeleteFacultyTrpcInput } from './input'

export const getFacultyDeleteStats = trpc.procedure.input(zDeleteFacultyTrpcInput).query(async ({ input, ctx }) => {
  if (!ctx.me) {
    throw Error('Unauthorized')
  }

  // Считаем всё, что затронет удаление факультета
  const faculty = await ctx.prisma.faculty.findUnique({
    where: { id: input.id },
    include: {
      _count: {
        select: {
          departments: true,
          messages: true,
        },
      },
      departments: {
        include: {
          _count: {
            select: { groups: true },
          },
        },
      },
    },
  })

  if (!faculty) {
    throw Error('Факультет не найден')
  }

  const groupsCount = faculty.departments.reduce((acc, dep) => acc + dep._count.groups, 0)

  return {
    departments: faculty._count.departments,
    messages: faculty._count.messages,
    groups: groupsCount,
  }
})

// УДАЛЕНИЕ
export const deleteFacultyTrpcRoute = trpc.procedure.input(zDeleteFacultyTrpcInput).mutation(async ({ input, ctx }) => {
  if (!ctx.me) {
    throw Error('Unauthorized')
  }

  // Благодаря onDelete: Cascade в схеме, Prisma сама удалит
  // кафедры, группы, студентов и сообщения, связанные с этим факультетом.
  await ctx.prisma.faculty.delete({
    where: { id: input.id },
  })

  return true
})
