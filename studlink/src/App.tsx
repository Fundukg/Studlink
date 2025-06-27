import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { dialoguesRouteParams, getDialoguesRoute, getWorkDeskRoute } from './lib/routes'
import { TrpcProvider } from './lib/trpc'
import { DialoguesPage } from './pages/DialoguePage'
import { WorkDeskPage } from './pages/WorkDeskPage'

export const App = () => {
  return (
    <TrpcProvider>
      <BrowserRouter>
        <Routes>
          <Route path={getWorkDeskRoute()} element={<WorkDeskPage />} />
          <Route path={getDialoguesRoute(dialoguesRouteParams)}  element={<DialoguesPage />} />
        </Routes>
      </BrowserRouter>
    </TrpcProvider>
  )
}
