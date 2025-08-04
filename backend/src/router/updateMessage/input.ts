import { z } from 'zod'
import { zCreateDistributionTrpcInput } from '../createDistribution/input'

export const zUpdateMessageTrpcInput = zCreateDistributionTrpcInput.extend({
  dialogueId: z.string().min(1),
})
