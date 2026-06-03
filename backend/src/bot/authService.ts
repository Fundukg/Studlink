import { prisma } from '../lib/prisma'
import { getPasswordHash } from '../utils/getPasswordHash'

export const authService = {
  async findUser(identifier: string) {
    return await prisma.user.findFirst({
      where: {
        OR: [
          { studentProfile: { student_id: identifier } },
          { nick: identifier },
        ],
      },
      include: { studentProfile: true },
    })
  },

  async verifyAndSetPassword(
    userId: string,
    password: string,
    isNewStudent: boolean
  ) {
    const hashed = getPasswordHash(password)
    if (isNewStudent) {
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
      })
    } else {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user || user.password !== hashed) {throw new Error('Неверный пароль')}
    }
  },

  async registerBot(userId: string, botId: string, externalId: string) {
    return await prisma.botUser.upsert({
      where: { userId_botId: { userId, botId } },
      update: { externalId, isActive: true },
      create: { userId, botId, externalId, isActive: true },
    })
  },
}
