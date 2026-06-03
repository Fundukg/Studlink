// backend/src/router/staff/updateTeacher/index.ts
import { UserRole } from '@prisma/client'
import { trpc } from '../../lib/trpc'
import { hasPermission } from '../../middleware/auth'
import { zUpdateTeacherInput } from './input'

export const updateTeacherTrpcRoute = trpc.procedure
  .use(hasPermission('manage:staff'))
  .input(zUpdateTeacherInput)
  .mutation(async ({ input, ctx }) => {
    return await ctx.prisma.$transaction(async (tx) => {
      // 1. Обновляем пользователя
      const updatedUser = await tx.user.update({
        where: { id: input.id },
        data: {
          nick: input.nick,
          firstName: input.firstName,
          lastName: input.lastName,
          middleName: input.middleName,
          role: UserRole.TEACHER,
        },
      })

      // 2. Upsert профиля преподавателя
      const profile = await tx.teacherProfile.upsert({
        where: { userId: input.id },
        update: {},
        create: { userId: input.id },
      })

      // 3. Синхронизация групп
      if (input.groupIds) {
        await tx.teacherAssignment.deleteMany({
          where: { teacherProfileId: profile.id },
        })
        if (input.groupIds.length > 0) {
          await tx.teacherAssignment.createMany({
            data: input.groupIds.map((gId) => ({
              teacherProfileId: profile.id,
              groupId: gId,
            })),
          })
        }
      }

      return updatedUser
    })
  })
