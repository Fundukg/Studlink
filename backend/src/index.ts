import express from 'express'
import * as trpsExpress from '@trpc/server/adapters/express'
import { trpcRouter } from './trpc'

const expressApp = express()
expressApp.get('/ping', (req, res) => {
  res.send('pong')
})
expressApp.use(
  '/trpc',
  trpsExpress.createExpressMiddleware({
    router: trpcRouter,
  })
)
expressApp.listen(3000, () => {
  console.info('Listening at http://localhost:3000')
})
