import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { DialogueSidebar } from './components/Layout/DialogueSideBar'
import { Layout } from './components/Layout/SideBar'
import { AppContextProvider } from './lib/ctx'
import * as routes from './lib/routes'
import { TrpcProvider } from './lib/trpc'
import { BotPage } from './pages/BotPage'
import { DepartmentPage } from './pages/DepartmentPage'
import { EditMessagePage } from './pages/EditMessagePage'
import { FacultyPage } from './pages/FacultyPage'
import { GroupPage } from './pages/GroupPage'
import ImportStudentPage from './pages/ImportStudentPage/Index'
import { NewDistributionPage } from './pages/NewDistributionPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SignInPage } from './pages/SignInPage'
import { SignOutPage } from './pages/SignOutPage'
import { SignUpPage } from './pages/SignUpPage'
import { StaffPage } from './pages/StaffPage'
import { StudentPage } from './pages/StudentPage'
import { ViewDialoguePage } from './pages/ViewDialoguePage'
import { ViewDistributionsPage } from './pages/ViewDistributionsPage'
import './styles/global.scss'

export const App = () => {
  const MessagesLayout = () => {
    return (
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <DialogueSidebar /> {/* Второй сайдбар */}
        <div style={{ flex: 1, position: 'relative' }}>
          <Outlet /> {/* Здесь будет само окно чата */}
        </div>
      </div>
    )
  }
  return (
    <TrpcProvider>
      <AppContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path={routes.getSignOutRoute()} element={<SignOutPage />} />

            <Route path="/" element={<Layout />}>
              <Route element={<MessagesLayout />}>
                <Route
                  path={routes.getViewDialogueRoute(
                    routes.viewdialogueRouteParams
                  )}
                  element={<ViewDialoguePage />}
                />
              </Route>
              <Route
                path={routes.getNewDistributionRoute()}
                element={<NewDistributionPage />}
              />
              <Route path={routes.getSignUpRoute()} element={<SignUpPage />} />
              <Route
                path={routes.getViewDepartmentRoute()}
                element={<DepartmentPage />}
              />
              <Route
                path={routes.getEditMessageRoute(
                  routes.editMessageRouteParams
                )}
                element={<EditMessagePage />}
              />
              <Route
                path={routes.getViewStudentRoute()}
                element={<StudentPage />}
              />
              <Route
                path={routes.getViewFacultyRoute()}
                element={<FacultyPage />}
              />
              <Route path={routes.getViewBotRoute()} element={<BotPage />} />
              <Route
                path={routes.getViewStaffRoute()}
                element={<StaffPage />}
              />
              <Route
                path={routes.getViewDistributionsRoute()}
                element={<ViewDistributionsPage />}
              />
              <Route
                path={routes.getViewGroupRoute()}
                element={<GroupPage />}
              />
              <Route
                path={routes.importStudentsRoute()}
                element={<ImportStudentPage />}
              />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
            <Route path={routes.getSignInRoute()} element={<SignInPage />} />
          </Routes>
        </BrowserRouter>
      </AppContextProvider>
    </TrpcProvider>
  )
}
