import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

// Используем global, чтобы предотвратить создание кучи подключений при hot-reload в ts-node-dev
const globalForPrisma = global as unknown as { prisma: PrismaClient }

const connectionString = `${process.env.DATABASE_URL}`
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in .env file')
}

const createPrismaClient = () => {
  // 1. Создаем пул подключений pg
  const pool = new Pool({ connectionString })
  
  // 2. Создаем адаптер для Prisma
  const adapter = new PrismaPg(pool)

  // 3. Инициализируем клиент с адаптером
  return new PrismaClient({ 
    adapter,
    // Логи помогут тебе при отладке в терминале
    log: ['error', 'warn'] 
  })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {globalForPrisma.prisma = prisma}