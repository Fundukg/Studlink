import { initTRPC} from '@trpc/server'
import * as trpcExpress from '@trpc/server/adapters/express'
import { type Express } from 'express'
import superjson from 'superjson'
import { expressHandler } from 'trpc-playground/handlers/express'
import { type TrpcRouter } from '../router'
import { type ExpressRequest } from '../utils/types'
import { type AppContext } from './ctx'

const getCreateTrpcContext =
  (appContext: AppContext) =>
  ({ req }: trpcExpress.CreateExpressContextOptions) => ({
    ...appContext,
    me: (req as ExpressRequest).decaneryStaff || null,
  })

type TrpcContext = Awaited<ReturnType<typeof getCreateTrpcContext>>

export const trpc = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
})

export const applyTrpcToExpressApp = async (expressApp: Express, AppContext: AppContext, trpcRouter: TrpcRouter) => {
  expressApp.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: trpcRouter,
      createContext: getCreateTrpcContext(AppContext),
    })
  )

  expressApp.use(
    '/trpc-playground',
    await expressHandler({
      trpcApiEndpoint: '/trpc',
      playgroundEndpoint: '/trpc-playground',
      router: trpcRouter,
      request: {
        superjson: true,
      },
    })
  )
}
