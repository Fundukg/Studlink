import crypto from 'crypto' 

export const getPasswordHashTrpcRoute =(password: string) => {
    return crypto.createHash('sha256').update(password).digest('hex')
}