import {z} from 'zod'

export const zDeleteBotTrpcInput = z.object({
    id: z.string().uuid(),
})