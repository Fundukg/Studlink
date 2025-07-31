import jwt from 'jsonwebtoken'
import { env } from '../lib/env'

export const signJWT = (decaneryStaff: string) => {
  return jwt.sign(decaneryStaff, env.JWT_SECRET)
}