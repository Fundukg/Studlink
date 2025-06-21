import { initTRPC } from "@trpc/server"

// interface WorkDeskItem {
//   nick: string
//   name: string
//   description: string
// } : { WorkDesk: WorkDeskItem[] }

const WorkDesk = [
  { nick: 'cool-set-nick-1', name: 'Profile', description: 'Description...' },
  { nick: 'cool-set-nick-2', name: 'Settings', description: 'Description...' },
  { nick: 'cool-set-nick-3', name: 'Calendar', description: 'Description...' },
  { nick: 'cool-set-nick-4', name: 'Schedule', description: 'Description...' },
]

const x: string = 'helsld161'
if (Math.random()) console.log(x)



const trpc = initTRPC.create()

export const TrpcRouter = trpc.router({
  getWorkDesk: trpc.procedure.query(() => {
    return { WorkDesk }
  }),
})

export type TrpcRouter = typeof TrpcRouter
