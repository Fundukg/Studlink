import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AppContextProvider } from './lib/ctx'
import * as routes from './lib/routes'
import { TrpcProvider } from './lib/trpc'
import { EditMessagePage } from './pages/EditMessagePage'
import { NewDepartmentPage } from './pages/NewDepartmentPage'
import { NewDistributionPage } from './pages/NewDistributionPage'
import { NewFacultyPage } from './pages/NewFacultypage'
import { NewGroupPage } from './pages/NewGroupPage'
import { NewStudentsPage } from './pages/NewStudentPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { ViewDialoguePage } from './pages/ViewDialoguePage'
// import { ViewDialoguesPage } from './pages/ViewDialoguesPage'
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
            <Route path="/" element={<Layout />}>
              <Route
                path={routes.getViewDialogueRoute(routes.viewdialogueRouteParams)}
                element={<ViewDialoguePage />}
              />
              <Route
                path={routes.getViewDistributionRoute(routes.viewdistributionRouteParams)}
                element={<ViewDistributionPage />}
              />
              <Route path={routes.getNewDistributionRoute()} element={<NewDistributionPage />} />
              <Route path={routes.getSignUpRoute()} element={<SignUpPage />} />
              <Route path={routes.getSignInRoute()} element={<SignInPage />} />
              <Route path={routes.getEditMessageRoute(routes.editMessageRouteParams)} element={<EditMessagePage />} />
              <Route path={routes.getNewStudentRoute()} element={<NewStudentsPage />} />
              <Route path={routes.getViewStudentRoute()} element={<ViewStudentPage />} />
              <Route path={routes.getViewDistributionsRoute()} element={<ViewDistributionsPage />} />
              <Route path={routes.getNewFacultyRoute()} element={<NewFacultyPage />} />
              <Route path={routes.getNewDepartmentRoute()} element={<NewDepartmentPage />} />
              <Route path={routes.getNewGroupRoute()} element={<NewGroupPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AppContextProvider>
    </TrpcProvider>
  )
}
