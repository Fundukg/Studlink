import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout/lndex'
import { dialoguesRouteParams, getDialoguesRoute, getWorkDeskRoute } from './lib/routes'
import { TrpcProvider } from './lib/trpc'
import { DialoguesPage } from './pages/DialoguePage'
import { WorkDeskPage } from './pages/WorkDeskPage'
import './styles/global.scss'

export const App = () => {
  return (
    <TrpcProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
          <Route path={getWorkDeskRoute()} element={<WorkDeskPage />} />
          <Route path={getDialoguesRoute(dialoguesRouteParams)} element={<DialoguesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TrpcProvider>
  )
}
