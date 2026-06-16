import 'dotenv/config'
import fs from 'fs' // Добавили
import { PrismaClient, Prisma } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/client'
import cors from 'cors'
import parse from 'csv-parser' // Добавили
import express from 'express'
import multer from 'multer' // Добавили
import cron from 'node-cron' // Добавили
import { startOkBot } from './bot/ok/poller'
import { startBot } from './bot/telegram'
import { startVkBot } from './bot/vk'
import { AppContext, createAppContext } from './lib/ctx'
import { env } from './lib/env'
import { applyPassportToExpressApp } from './lib/passport'
import { applyTrpcToExpressApp } from './lib/trpc'
import upload, { processStudents } from './pages/api/upload'
import { trpcRouter } from './router'
import { createInitialAdmin } from './scripts/initAdmin'
import { createServer } from 'http'
import { initSocket } from './lib/socket'

const uploadMiddleware = multer({ dest: '/tmp' })

void (async () => {
  let ctx: AppContext | null = null
  try {
    ctx = createAppContext()

    const expressApp = express()
    expressApp.use(
      cors({ origin: 'http://localhost:5173', credentials: true })
    ) // Настрой корс явно
    expressApp.get('/ping', (req, res) => {
      res.send('pong')
    })
    expressApp.post(
      '/api/upload',
      uploadMiddleware.single('file'),
      async (req, res) => {
        // Убрали лишние возвраты типов
        const filePath = req.file?.path

        if (!filePath) {
          res.status(400).json({ error: 'Файл не найден' })
          return // Просто return без значения
        }

        const results: any[] = []
        try {
          await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
              .pipe(parse({ separator: ',' }))
              .on('data', (data) => results.push(data))
              .on('error', reject)
              .on('end', resolve)
          })

          const report = await processStudents(results, ctx!.prisma)
          res.json(report)
        } catch (error: any) {
          console.error('Import error:', error)
          res.status(500).json({ error: error.message })
        } finally {
          if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
          }
        }
      }
    )
    const httpServer = createServer(expressApp) // ваш express app
    initSocket(httpServer)

    httpServer.listen(3000, () => {
      console.log('Сервер запущен на порту 3000')
    })

    applyPassportToExpressApp(expressApp, ctx)
    await applyTrpcToExpressApp(expressApp, ctx, trpcRouter)
    expressApp.listen(env.PORT, () => {
      console.info(`Listening at http://localhost:${env.PORT}`)
    })
    createInitialAdmin()
    // eslint-disable-next-line node/no-process-env
    if (process.env.TELEGRAM_BOT_TOKEN) {
      startBot()
      startVkBot()
      startOkBot.start()
      // console.log('Telegram бот инициализирован');
    } else {
      console.error('TELEGRAM_BOT_TOKEN не указан, бот не запущен')
    }
  } catch (error) {
    console.error(error)
    await ctx?.stop()
  }
})()
