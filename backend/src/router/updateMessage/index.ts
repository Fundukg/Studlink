// import { trpc } from '../../lib/trpc'
// import { zUpdateMessageTrpcInput } from './input'

// export const updateMessageTrpcRoute = trpc.procedure
//   .input(zUpdateMessageTrpcInput)
//   .mutation(async ({ ctx, input }) => {
//     const { dialogueId, ...updateData } = input
    
//     if (!ctx.me) {
//       throw new Error('UNAUTHORIZED')
//     }
    
//     // Находим сообщение
//     const message = await ctx.prisma.message.findUnique({
//       where: { id: dialogueId },
//       include: { staff: true }
//     })
    
//     if (!message) {
//       throw new Error('NOT_FOUND')
//     }
    
//     // Проверяем права доступа
//     if (ctx.me.id !== message.staffId) {
//       throw new Error('NOT_YOUR_MESSAGE')
//     }
    
//     // Обновляем сообщение
//     await ctx.prisma.message.update({
//       where: { id: dialogueId },
//       data: updateData
//     })
    
//     return true
//   })