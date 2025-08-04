import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server'
import { trpc } from '../lib/trpc'
// @index('./**/index.ts', f => `import { ${f.path.split('/').slice(0, -1).pop()}TrpcRoute } from '${f.path.split('/').slice(0, -1).join('/')}'`)
import { createDistributionTrpcRoute } from './createDistribution'
import { getDialoguesTrpcRoute } from './getDialogues'
import { getMeTrpcRoute } from './getMe'
import { getWorkDeskTrpcRoute } from './getWorkDesk'
import { signInTrpcRoute } from './signIn'
import { signUpTrpcRoute } from './signUp'
import { updateMessageTrpcRoute } from './updateMessage'
// @endindex
export const trpcRouter = trpc.router({
  // @index('./**/index.ts', f => `${f.path.split('/').slice(0, -1).pop()}: ${f.path.split('/').slice(0, -1).pop()}TrpcRoute,`)
  createDistribution: createDistributionTrpcRoute,
  getDialogues: getDialoguesTrpcRoute,
  getMe: getMeTrpcRoute,
  getWorkDesk: getWorkDeskTrpcRoute,
  signIn: signInTrpcRoute,
  signUp: signUpTrpcRoute,
  updateMessage: updateMessageTrpcRoute,
  // @endindex
})

export type TrpcRouter = typeof trpcRouter
export type TrpcRouterInput = inferRouterInputs<TrpcRouter>
export type TrpcRouterOutput = inferRouterOutputs<TrpcRouter>
