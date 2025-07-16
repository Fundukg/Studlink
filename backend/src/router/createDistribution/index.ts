import { Dialogue } from '../../lib/dialogue'
import { trpc } from '../../lib/trpc'
import { zCreateDistributionTrpcInput } from './input'

export const createDistributionTrpcRoute = trpc.procedure.input(zCreateDistributionTrpcInput).mutation(({ input }) => {
  if (Dialogue.find((dialogue) => dialogue.course === input.course)) {
    throw Error('Тут должна быть ошибка(Типа повоторной рассылки)')
  }
  Dialogue.unshift(input)
  return true
})
