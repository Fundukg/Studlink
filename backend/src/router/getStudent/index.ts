import { trpc } from "../../lib/trpc"


export const getStudentTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
    
    const Student = await ctx.prisma.student.findMany({
        select: {
            id: true,
            student_id: true,
            name: true,
            course: true,
            department: true,
            directions: true,
            group: true,
            createdAt: true,
        }
    })
    return { Student }
}) 