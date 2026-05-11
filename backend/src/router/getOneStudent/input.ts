import {z} from 'zod'

export const zGetOneStudentTrpcInput = z.object({
    id: z.string().uuid(),
})