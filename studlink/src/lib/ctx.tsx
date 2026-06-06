import type { TrpcRouterOutput } from '@parkstick/backend/src/router'
import { createContext, useContext } from 'react'
import { Loader } from '../components/Loader'
import { trpc } from './trpc'

export type AppContext = {
  me: TrpcRouterOutput['getMe']['me']
  isLoading: boolean   // ← добавили
}

const AppReactContext = createContext<AppContext>({
  me: null,
  isLoading: true,     // значение по умолчанию
})

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, error, isLoading, isFetching, isError } = trpc.getMe.useQuery()

  return (
    <AppReactContext.Provider
      value={{
        me: data?.me || null,
        isLoading: isLoading || isFetching,
      }}
    >
      {isLoading || isFetching ? (
        <p><Loader /></p>
      ) : isError ? (
        <p>Error: {error.message}</p>
      ) : (
        children
      )}
    </AppReactContext.Provider>
  )
}
export const useAppContext = () => {
  return useContext(AppReactContext)
}

export const useMe = () => {
  const { me, isLoading } = useAppContext()
  return { user: me, isLoading }   // me переименовываем в user для единообразия
}
