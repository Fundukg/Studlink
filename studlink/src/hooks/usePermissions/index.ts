// hooks/usePermissions.ts
import { trpc } from '../../lib/trpc'

export const usePermissions = () => {
  const { data: user } = trpc.getMe.useQuery()

  const isAdmin = user?.me?.title === 'ADMIN'
  const isTeacher = user?.me?.title === 'TEACHER'
  const isStudent = user?.me?.title === 'STUDENT'
  const isClient = user?.me?.title === 'DEANERY'

  // const canCreateTraining = isAdmin || isTeacher
  // const canViewRegistrations = isAdmin || isTeacher
  // const canCancelAnyRegistration = isAdmin || isTeacher
  // const canRegister = isAdmin || isTeacher || isStudent || isClient
  // const canEditProfile = true // Все пользователи могут редактировать свой профиль

  return {
    isAdmin,
    isTeacher,
    isStudent,
    isClient,
    // canCreateTraining,
    // canViewRegistrations,
    // canCancelAnyRegistration,
    // canRegister,
    // canEditProfile,
  }
}
