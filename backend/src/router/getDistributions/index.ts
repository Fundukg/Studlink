import { trpc } from '../../lib/trpc'
import { isAdmin, isDeanery } from '../../utils/role'

export const getDistributionsTrpcRoute = trpc.procedure.query(
  async ({ ctx }) => {
    if (!ctx.me) {
      throw Error('Unauthorized')
    }
    if (!isAdmin(ctx.me?.role)  && !isDeanery(ctx.me?.role)) {
        throw new Error('Доступ запрещен: недостаточно прав')
      }
    const distributions = await ctx.prisma.distribution.findMany({
      include: {
        staff: { select: { nick: true } },
        _count: { select: { messages: true } }, // Считаем успешные доставки
      },
      orderBy: { createdAt: 'desc' },
    })

    return {
      distributions: distributions.map((d: any) => ({
        id: d.id,
        text: d.text,
        createdAt: d.createdAt,
        sender: d.staff?.nick || 'Система',
        successCount: d._count.messages,
        targetType: d.targetType,
        platform: d.platform,
      })),
    }
  }
)
