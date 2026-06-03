// backend/src/router/getDistribution/index.ts
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { trpc } from '../../lib/trpc'
import { hasPermission, isDeanery, isTeacher } from '../../middleware/auth'

export const getDistributionTrpcRoute = trpc.procedure
  .use(hasPermission('view:messages'))
  .input(z.object({ distributionId: z.string() }))
  .query(async ({ ctx, input }) => {
    const me = ctx.me!

    // 1. Получаем рассылку
    const distribution = await ctx.prisma.distribution.findUnique({
      where: { id: input.distributionId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            nick: true,
            role: true,
          },
        },
      },
    })

    if (!distribution) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Рассылка не найдена',
      })
    }

    // 2. ПРОВЕРКА ПРАВ
    if (isTeacher(me.role)) {
      // Преподаватель видит только свои рассылки
      if (distribution.senderId !== me.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Нет доступа к этой рассылке',
        })
      }
    } else if (isDeanery(me.role)) {
      // Деканат – проверяем доступ к целевой аудитории
      const deanery = await ctx.prisma.deaneryProfile.findUnique({
        where: { userId: me.id },
        select: { facultyId: true },
      })
      if (!deanery) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Профиль деканата не найден',
        })
      }

      const facultyId = deanery.facultyId

      // Проверка в зависимости от targetType
      switch (distribution.targetType) {
        case 'FACULTY':
          if (distribution.targetId !== facultyId) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Нет доступа к рассылке другого факультета',
            })
          }
          break
        case 'DEPARTMENT': {
          if (!distribution.targetId)
            {throw new TRPCError({ code: 'FORBIDDEN' })}
          const department = await ctx.prisma.department.findFirst({
            where: { id: distribution.targetId, facultyId },
          })
          if (!department) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Кафедра не принадлежит вашему факультету',
            })
          }
          break
        }
        case 'GROUP': {
          if (!distribution.targetId)
            {throw new TRPCError({ code: 'FORBIDDEN' })}
          const group = await ctx.prisma.group.findFirst({
            where: { id: distribution.targetId, department: { facultyId } },
          })
          if (!group) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Группа не принадлежит вашему факультету',
            })
          }
          break
        }
        case 'COURSE': {
          // Проверяем, что на факультете есть хотя бы одна группа с этим курсом
          const courseExists = await ctx.prisma.group.findFirst({
            where: {
              department: { facultyId },
              course: distribution.course ?? undefined,
            },
          })
          if (!courseExists) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Курс отсутствует на вашем факультете',
            })
          }
          break
        }
        case 'ALL':
          // Деканат не видит глобальные рассылки (по желанию можно разрешить)
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Деканат не имеет доступа к глобальным рассылкам',
          })
        default:
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' })
      }
    }

    // 3. Получение деталей цели (для отображения)
    let targetDetails: { id: string; name: string }[] = []

    switch (distribution.targetType) {
      case 'FACULTY':
        if (distribution.targetId) {
          const faculty = await ctx.prisma.faculty.findUnique({
            where: { id: distribution.targetId },
            select: { id: true, name: true },
          })
          if (faculty) {targetDetails = [faculty]}
        }
        break
      case 'DEPARTMENT':
        if (distribution.targetId) {
          const department = await ctx.prisma.department.findUnique({
            where: { id: distribution.targetId },
            select: { id: true, name: true },
          })
          if (department) {targetDetails = [department]}
        }
        break
      case 'GROUP':
        if (distribution.targetId) {
          const group = await ctx.prisma.group.findUnique({
            where: { id: distribution.targetId },
            select: { id: true, name: true },
          })
          if (group) {targetDetails = [group]}
        }
        break
      case 'COURSE':
        if (
          distribution.course !== null &&
          distribution.course !== undefined
        ) {
          targetDetails = [
            {
              id: String(distribution.course),
              name: `${distribution.course} курс`,
            },
          ]
        }
        break
      case 'ALL':
        targetDetails = [] // глобальная рассылка
        break
    }

    // 4. Статистика
    const totalSent = await ctx.prisma.message.count({
      where: { distributionId: distribution.id },
    })

    const platformStats = await ctx.prisma.message.groupBy({
      by: ['platform'],
      where: { distributionId: distribution.id },
      _count: true,
    })

    return {
      id: distribution.id,
      text: distribution.text,
      createdAt: distribution.createdAt,
      platform: distribution.platform,
      targetType: distribution.targetType,
      targets: targetDetails,
      sender: {
        id: distribution.sender.id,
        name: `${distribution.sender.firstName} ${distribution.sender.lastName}`.trim(),
        nick: distribution.sender.nick,
        role: distribution.sender.role,
      },
      stats: {
        totalSent,
        byPlatform: platformStats.map((ps) => ({
          platform: ps.platform,
          count: ps._count,
        })),
      },
    }
  })
