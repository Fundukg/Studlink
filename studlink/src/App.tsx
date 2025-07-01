import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import * as routes from './lib/routes'
import { TrpcProvider } from './lib/trpc'
import { DialoguesPage } from './pages/DialoguePage'
import { NewDistributionPage } from './pages/NewDistributionPage'
import { WorkDeskPage } from './pages/WorkDeskPage'
import './styles/global.scss'


export const App = () => {
  return (
    <TrpcProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path={routes.getWorkDeskRoute()} element={<WorkDeskPage />} />
            <Route path={routes.getDialoguesRoute(routes.dialoguesRouteParams)} element={<DialoguesPage />} />
            <Route path={routes.getNewDistributionRoute()} element={<NewDistributionPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TrpcProvider>
  )
}
