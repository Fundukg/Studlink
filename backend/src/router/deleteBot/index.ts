import { trpc } from '../../lib/trpc'
import { isAdmin } from '../../utils/role'
import { zDeleteBotTrpcInput } from './input'

// ПОЛУЧЕНИЕ СТАТИСТИКИ ПЕРЕД УДАЛЕНИЕМ
export const getBotDeleteStats = trpc.procedure
  .input(zDeleteBotTrpcInput)
  .query(async ({ input, ctx }) => {
    // Проверка прав (как в вашем примере с созданием бота)
    isAdmin(ctx.me?.role)

    const bot = await ctx.prisma.bot.findUnique({
      where: { id: input.id },
      select: {
        _count: {
          select: {
            users: true,   // Сколько студентов привязано к боту
            messages: true, // Сколько сообщений прошло через бота
          },
        },
      },
    })

    if (!bot) {
      throw Error('Бот не найден')
    }

    return bot._count
  })

// УДАЛЕНИЕ БОТА
export const deleteBotTrpcRoute = trpc.procedure
  .input(zDeleteBotTrpcInput)
  .mutation(async ({ input, ctx }) => {
    isAdmin(ctx.me?.role)

    // Проверяем существование бота
    const bot = await ctx.prisma.bot.findUnique({
      where: { id: input.id }
    })
    
    if (!bot) {
      throw Error('Бот не найден')
    }

    // Если в схеме Prisma для BotUser и Message не стоит onDelete: Cascade,
    // нужно сначала удалить связанные записи вручную, чтобы не было ошибки БД.
    // Если Cascade настроен — этот блок можно пропустить.
    await ctx.prisma.$transaction([
      ctx.prisma.botUser.deleteMany({ where: { botId: input.id } }),
      ctx.prisma.message.deleteMany({ where: { botId: input.id } }),
      ctx.prisma.bot.delete({ where: { id: input.id } }),
    ])

    return true
  })