import { trpc } from '../../lib/trpc'

export const getStudentTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  const Student = await ctx.prisma.student.findMany({
    select: {
      id: true,
      student_id: true,
      name: true,
      course: true,
      group: {
        select: {
          id: true,
          name: true,
          department: {
            select: {
              id: true,
              name: true,
              faculty: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      createdAt: true,
    },
  })
  return { Student }
})
