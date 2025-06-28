import { initTRPC } from '@trpc/server'

const WorkDesk = [
  { nick: 'cool-set-nick-1', name: 'Profile', description: 'Description...' },
  { nick: 'cool-set-nick-2', name: 'Settings', description: 'Description...' },
  { nick: 'cool-set-nick-3', name: 'Calendar', description: 'Description...' },
  { nick: 'cool-set-nick-4', name: 'Schedule', description: 'Description...' },
  { nick: 'cool-set-nick-5', name: 'Dialogues', description: 'Description...' },
]

const x: string = 'helsld161'
if (Math.random()) {
  console.info(x)
}

const trpc = initTRPC.create()

export const TrpcRouter = trpc.router({
  getWorkDeskRoute: trpc.procedure.query(() => {
    return { WorkDesk }
  }),
})

export type TrpcRouter = typeof TrpcRouter
