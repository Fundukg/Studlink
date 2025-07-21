import { initTRPC } from '@trpc/server'
import * as trpcExpress from '@trpc/server/adapters/express'
import { type Express } from 'express'
import {type AppContext} from '../lib/ctx'
import { type TrpcRouter } from '../router/index'

export const trpc = initTRPC.context<AppContext>().create()

export const applyTrpcToExpressApp = (expressApp: Express, AppContext: AppContext, trpcRouter: TrpcRouter) => {
    expressApp.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
        router: trpcRouter,
        createContext: () => AppContext
    })
)
}