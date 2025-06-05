import { initTRPC } from '@trpc/server'

const work_desk = [
  { nick: 'cool-set-nick-1', name: 'Profile', description: 'Description...' },
  {
    nick: 'cool-set-nick-2',
    name: 'Settings',
    description: 'Description...',
  },
  {
    nick: 'cool-set-nick-3',
    name: 'Calender',
    description: 'Description...',
  },
  { nick: 'cool-set-nick-4', name: 'Schedule', description: 'Description...' },
]

const trpc = initTRPC.create()

export const trpcRouter = trpc.router({
  getWork_desk: trpc.procedure.query(() => {
    return { work_desk }
  }),
})

export type trpcRouter = typeof trpcRouter 