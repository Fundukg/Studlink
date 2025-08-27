import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DialoguesBar } from './components/DialoguesBar'
import { DistribitionBar } from './components/DistribitionBar'
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
import { ViewDialoguePage } from './pages/ViewDialoguePage'
import { ViewDialoguesPage } from './pages/ViewDialoguesPage'
import { ViewDistributionPage } from './pages/ViewDistributionPage'
import { ViewDistributionsPage } from './pages/ViewDistributionsPage'
import { ViewStudentPage } from './pages/ViewStudentPage'
import './styles/global.scss'


export const App = () => {
  return (
    <TrpcProvider>
      <AppContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path={routes.getViewDialogueRoute(routes.viewdialogueRouteParams)} element={<DialoguesBar />}>
              <Route
                path={routes.getViewDialogueRoute(routes.viewdialogueRouteParams)}
                element={<ViewDialoguePage />}
              />
            </Route>
             <Route path={routes.getViewDistributionRoute(routes.viewdistributionRouteParams)} element={<DistribitionBar />}>
              <Route
                path={routes.getViewDistributionRoute(routes.viewdistributionRouteParams)}
                element={<ViewDistributionPage />}
              />
            </Route>
            <Route path={routes.getSignOutRoute()} element={<SignOutPage />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route element={<Layout />}>
              <Route path={routes.getViewDialoguesRoute()} element={<ViewDialoguesPage />} />
              <Route path={routes.getNewDistributionRoute()} element={<NewDistributionPage />} />
              <Route path={routes.getSignUpRoute()} element={<SignUpPage />} />
              <Route path={routes.getSignInRoute()} element={<SignInPage />} />
              <Route path={routes.getEditMessageRoute(routes.editMessageRouteParams)} element={<EditMessagePage />} />
              <Route path={routes.getNewStudentRoute()} element={<NewStudentsPage />} />
              <Route path={routes.getViewStudentRoute()} element={<ViewStudentPage />} />
              <Route path={routes.getViewDistributionsRoute()} element={<ViewDistributionsPage />} />
              {/* <Route
                path={routes.getViewDistributionRoute(routes.viewdistributionRouteParams)}
                element={<ViewDistributionPage />}
              /> */}
            </Route>
          </Routes>
        </BrowserRouter>
      </AppContextProvider>
    </TrpcProvider>
  )
}
