import { type DecaneryStaff } from '@prisma/client'
import { type Request } from 'express'

export type ExpressRequest = Request & { 
    decaneryStaff: DecaneryStaff | undefined 
}