import { initTRPC } from '@trpc/server'
import _ from 'lodash'
import { z } from 'zod'

const WorkDesk = _.times(100, (i) => ({
  nick: `cool-set-nick-${i}`,
  name: `Content ${i}`,
  description: 'Description...',
  text: _.times(100, (j) => `<p>Text paragraph ${j} of content ${i}</p>`).join(''),
}))

// const WorkDesk = [
//   { nick: 'cool-set-nick-1', name: 'Profile', description: 'Description...' },
//   { nick: 'cool-set-nick-2', name: 'Settings', description: 'Description...' },
//   { nick: 'cool-set-nick-3', name: 'Calendar', description: 'Description...' },
//   { nick: 'cool-set-nick-4', name: 'Schedule', description: 'Description...' },
//   { nick: 'cool-set-nick-5', name: 'Dialogues', description: 'Description...' },
// ]

const trpc = initTRPC.create()

export const TrpcRouter = trpc.router({
  getWorkDeskRoute: trpc.procedure.query(() => {
    return { WorkDesk: WorkDesk.map((WorkDesk) => _.pick(WorkDesk, ['nick', 'name', 'description'])) }
  }),
  getDialogues: trpc.procedure
    .input(
      z.object({
        workdesk: z.string(),
      })
    )
    .query(({ input }) => {
      const workdesk = WorkDesk.find((WorkDesk) => WorkDesk.nick === input.workdesk)
      return { WorkDesk: workdesk || null }
    }),
})

export type TrpcRouter = typeof TrpcRouter
