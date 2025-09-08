import { z } from 'zod'

export const zCreateFacultyTrpcInput = z.object({
    name: z.string().min(1, 'Название обязательно'),
})