import { trpc } from '../../lib/trpc'
import { zGetOneStudentTrpcInput } from './input'

export const getOneStudentTrpcRoute = trpc.procedure
  .input(zGetOneStudentTrpcInput)
  .query(async ({ input, ctx }) => {
    if (!ctx.me) {
      throw Error('Unauthorized')
    }
    const student = await ctx.prisma.student.findUnique({
      where: {
        id: input.id,
      },
      include: {
        // 1. Идем в группу
        group: {
          include: {
            // 2. Из группы идем в кафедру (department)
            department: {
              include: {
                // 3. Из кафедры идем на факультет (faculty)
                faculty: true 
              }
            }
          }
        },
        // Информация об авторизациях в ботах
        botUsers: {
          include: {
            bot: true
          }
        },
        // Если хочешь подтянуть последние сообщения студента (опционально)
        _count: {
          select: {
            sentMessages: true,
            receivedMessages: true
          }
        }
      }
    })

    if (!student) {
      throw new Error('Студент не найден')
    }

    return student
  })