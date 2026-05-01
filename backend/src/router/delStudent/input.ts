import {z} from 'zod'   

export const zDeleteStudentTrpcInput = z.object({
    id: z.string().uuid(),
})