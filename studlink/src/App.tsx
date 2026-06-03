import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { DialogueSidebar } from './components/Layout/DialogueSideBar'
import { Layout } from './components/Layout/SideBar'
import { SetupProfileRoute } from './components/SetupProfileRoute'
// import { ProtectedRoute } from './components/ProtectedRoute'
import { AppContextProvider } from './lib/ctx'
import * as routes from './lib/routes'
import { TrpcProvider } from './lib/trpc'
import { AdminPage } from './pages/AdminPage'
import { BotPage } from './pages/BotPage'
import { DeaneryPage } from './pages/DeaneryPage'
import { DepartmentPage } from './pages/DepartmentPage'
// import { EditMessagePage } from './pages/EditMessagePage'
import { FacultyPage } from './pages/FacultyPage'
import { GroupPage } from './pages/GroupPage'
import ImportStudentPage from './pages/ImportStudentPage/Index'
import { NewDistributionPage } from './pages/NewDistributionPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProfilePage } from './pages/ProfilePage'
import { ProfileSetupPage } from './pages/ProfileSetupPage'
import { SignInPage } from './pages/SignInPage'
import { SignOutPage } from './pages/SignOutPage'
import { StudentPage } from './pages/StudentPage'
import { TeacherPage } from './pages/TeacherPage'
import { ViewDialoguePage } from './pages/ViewDialoguePage'
import { ViewDistributionsPage } from './pages/ViewDistributionsPage'
import './styles/global.scss'

const MessagesLayout = () => (
  <div style={{ display: 'flex', width: '100%', height: '100%' }}>
    <DialogueSidebar />
    <div style={{ flex: 1, position: 'relative' }}>
      <Outlet />
    </div>
  </div>
)

export const App = () => (
  <TrpcProvider>
    <AppContextProvider>
      <BrowserRouter>
        <Routes>
          {/* Публичный маршрут входа */}
          <Route path={routes.getSignInRoute()} element={<SignInPage />} />

          {/* Все защищённые маршруты */}
          {/* <Route element={<ProtectedRoute />}> */}
            <Route path={routes.getSignOutRoute()} element={<SignOutPage />} />

            <Route
              path={routes.getProfileSetupRoute()}
              element={
                <SetupProfileRoute>
                  <ProfileSetupPage />
                </SetupProfileRoute>
              }
            />

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
              <Route
                path={routes.getViewDepartmentRoute()}
                element={<DepartmentPage />}
              />
              {/* <Route
                path={routes.getEditMessageRoute(
                  routes.editMessageRouteParams
                )}
                element={<EditMessagePage />}
              /> */}
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
                path={routes.getViewDeaneryRoute()}
                element={<DeaneryPage />}
              />
              <Route
                path={routes.getViewAdminRoute()}
                element={<AdminPage />}
              />
              <Route
                path={routes.getViewTeacherRoute()}
                element={<TeacherPage />}
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
              <Route
                path={routes.getProfileRoute()}
                element={<ProfilePage />}
              />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          {/* </Route> */}
        </Routes>
      </BrowserRouter>
    </AppContextProvider>
  </TrpcProvider>
)
