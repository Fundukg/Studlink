// import _ from 'lodash'
// import { z } from 'zod'





// export const TrpcRouter = trpc.router({
//   getWorkDesk: trpc.procedure.query(() => {
//     return { WorkDesk: WorkDesk.map((WorkDesk) => _.pick(WorkDesk, ['nick', 'name', 'description'])) }
//   }),
//   getDialogues: trpc.procedure
//     .input(
//       z.object({
//         workdesk: z.string(),
//       })
//     )
//     .query(({ input }) => {
//       const workdesk = WorkDesk.find((WorkDesk) => WorkDesk.nick === input.workdesk)
//       return { WorkDesk: workdesk || null }
//     }),
// })

// export type TrpcRouter = typeof TrpcRouter
