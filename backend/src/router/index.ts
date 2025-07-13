import { trpc } from '../lib/trpc'
// @index('./**/index.ts', f => `import { ${f.path.split('/').slice(0, -1).pop()}TrpcRoute } from '${f.path.split('/').slice(0, -1).join('/')}'`)
import { createDistributionTrpcRoute } from './createDistribution'
import { getDialoguesTrpcRoute } from './getDialogues'
import { getWorkDeskTrpcRoute } from './getWorkDesk'
// @endindex
export const trpcRouter = trpc.router({
// @index('./**/index.ts', f => `${f.path.split('/').slice(0, -1).pop()}: ${f.path.split('/').slice(0, -1).pop()}TrpcRoute,`)
createDistribution: createDistributionTrpcRoute,
getDialogues: getDialoguesTrpcRoute,
getWorkDesk: getWorkDeskTrpcRoute,
// @endindex
})

export type TrpcRouter = typeof trpcRouter  