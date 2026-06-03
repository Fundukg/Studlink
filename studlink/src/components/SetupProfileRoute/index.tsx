import { Navigate } from 'react-router-dom'
import { useProfileCheck } from '../../hooks/UseProfileCheck'
import { getStartRoute, getSignInRoute } from '../../lib/routes'

export const SetupProfileRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isProfileFilled } = useProfileCheck()

  if (isLoading) {
    return <div>Загрузка...</div>
  }

  if (!user) {
    return <Navigate to={getSignInRoute()} replace />
  }

  if (isProfileFilled) {
    return <Navigate to={getStartRoute()} replace />
  }

  return <>{children}</>
}
