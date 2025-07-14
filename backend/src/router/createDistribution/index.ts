import { Dialogue } from '../../lib/dialogue'
import { trpc } from '../../lib/trpc'
import { zCreateDistributionTrpcInput } from './input'

export const createDistributionTrpcRoute = trpc.procedure.input(zCreateDistributionTrpcInput).mutation(({ input }) => {
  Dialogue.unshift(input)
  return true
})
