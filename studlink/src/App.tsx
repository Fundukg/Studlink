import { TrpcProvider } from './lib/trpc'
import { WorkDesk } from './pages/WorkDeskPage'

export const App = () => {
  return (
    <TrpcProvider>
      <WorkDesk />
    </TrpcProvider>
  )
}
