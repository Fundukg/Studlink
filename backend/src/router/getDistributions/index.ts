// backend/src/router/distribution/list.ts
import { trpc } from '../../lib/trpc'
import { hasPermission,isDeanery, isTeacher } from '../../middleware/auth'

export const getDistributionsTrpcRoute = trpc.procedure
  .use(hasPermission('view:messages'))
  .query(async ({ ctx }) => {
    const me = ctx.me!

    // Определяем условия фильтрации для рассылок
    let distributionWhere: any = {}

    if (isTeacher(me.role)) {
      // Преподаватель видит ТОЛЬКО свои рассылки
      distributionWhere = { senderId: me.id }
    } else if (isDeanery(me.role)) {
      // Деканат видит рассылки своего факультета
      // (фильтруем по targetId, если рассылка была по факультету)
      const deanery = await ctx.prisma.deaneryProfile.findUnique({
        where: { userId: me.id },
        select: { facultyId: true },
      })
      
      if (deanery) {
        distributionWhere = {
          OR: [
            { senderId: me.id }, // Свои рассылки
            { targetType: 'FACULTY', targetId: deanery.facultyId } // Рассылки по его факультету
          ]
        }
      } else {
        distributionWhere = { senderId: me.id } // Если профиля нет, только свои
      }
    }
    // ADMIN видит всё (пустой объект where)

    const distributions = await ctx.prisma.distribution.findMany({
      where: distributionWhere,
      include: {
        sender: { 
          select: { firstName: true, lastName: true, nick: true } 
        },
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return {
      distributions: distributions.map((d) => ({
        id: d.id,
        text: d.text,
        createdAt: d.createdAt,
        // Формируем имя отправителя из User
        sender: d.sender.nick || `${d.sender.firstName} ${d.sender.lastName}`.trim(),
        successCount: d._count.messages,
        targetType: d.targetType,
        platform: d.platform,
      })),
    }
  })