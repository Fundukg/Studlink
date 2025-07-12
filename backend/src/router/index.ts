import { trpc } from '../lib/trpc'
import { getDialoguesTrpcRoute } from './getDialogues'
import { getWorkDeskTrpcRoute } from './getWorkDesk'

export const trpcRouter = trpc.router({
  getWorkDesk: getWorkDeskTrpcRoute,
  getDialogues: getDialoguesTrpcRoute,
})

export type TrpcRouter = typeof trpcRouter  