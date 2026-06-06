import { UserRole } from "@prisma/client"
import { trpc } from "../../lib/trpc"
import { hasPermission } from "../../middleware/auth"
import { getPasswordHash } from "../../utils/getPasswordHash"
import { zCreateTeacherInput } from "./input"

// backend/src/router/staff/createTeacher/index.ts
export const createTeacherTrpcRoute = trpc.procedure
  .use(hasPermission('manage:staff'))
  .input(zCreateTeacherInput)
  .mutation(async ({ input, ctx }) => {
    return await ctx.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          nick: input.nick,
          password: getPasswordHash(input.password),
          firstName: input.firstName,
          lastName: input.lastName,
          middleName: input.middleName,
          role: UserRole.TEACHER,
          firstLogin: true,
          teacherProfile: {
            create: {
              // Если есть группы, создаем массив связей
              assignments: input.groupIds
                ? {
                    create: input.groupIds.map((groupId: any) => ({
                      groupId,
                    })),
                  }
                : undefined,
            },
          },
        },
      })
      return { userId: user.id }
    })
  })
