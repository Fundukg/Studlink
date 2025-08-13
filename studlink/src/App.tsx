import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DialoguesBar } from './components/DialoguesBar'
import { Layout } from './components/Layout'
import { AppContextProvider } from './lib/ctx'
import * as routes from './lib/routes'
import { TrpcProvider } from './lib/trpc'
import { EditMessagePage } from './pages/EditMessagePage'
import { NewDistributionPage } from './pages/NewDistributionPage'
import { NewStudentsPage } from './pages/NewStudentPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SignInPage } from './pages/SignInPage'
import { SignOutPage } from './pages/SignOutPage'
import { SignUpPage } from './pages/SignUpPage'
import { ViewDialoguesPage } from './pages/ViewDialoguePage'
import { WorkDeskPage } from './pages/WorkDeskPage'
import './styles/global.scss'

export const App = () => {
  return (
    <TrpcProvider>
      <AppContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path={routes.getViewDialoguesRoute(routes.viewdialoguesRouteParams)} element={<DialoguesBar />}>
              <Route path={routes.getViewDialoguesRoute(routes.viewdialoguesRouteParams)} element={<ViewDialoguesPage />} />
            </Route>
            <Route path={routes.getSignOutRoute()} element={<SignOutPage />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route element={<Layout />}>
              <Route path={routes.getWorkDeskRoute()} element={<WorkDeskPage />} />
              <Route path={routes.getNewDistributionRoute()} element={<NewDistributionPage />} />
              <Route path={routes.getSignUpRoute()} element={<SignUpPage />} />
              <Route path={routes.getSignInRoute()} element={<SignInPage />} />
              <Route path={routes.getEditMessageRoute(routes.editMessageRouteParams)} element={<EditMessagePage />} />
              <Route path={routes.getStudentRoute()} element={<NewStudentsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppContextProvider>
    </TrpcProvider>
  )
}
