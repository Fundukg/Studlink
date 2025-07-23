import {z} from 'zod'

export const zSingUpTrpcInput = z.object({
    nick: z.string().min(1).regex(/^[a-zА-Яа-я0-9-]+$/, 'Nickname contain only lowercase letters number and dashes'), 
    password: z.string().min(1),
})