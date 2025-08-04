import { type Staff } from '@prisma/client'
import { type Request } from 'express'

export type ExpressRequest = Request & { 
    user: Staff | undefined 
}