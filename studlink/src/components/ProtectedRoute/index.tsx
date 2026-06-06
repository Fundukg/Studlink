// components/ProtectedRoute.tsx
import { useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useProfileCheck } from '../../hooks/useProfileCheck'

export const ProtectedRoute = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isLoading, isProfileFilled } = useProfileCheck()
  const redirectInProgress = useRef(false)

  useEffect(() => {
    if (isLoading || !user) {return}
    if (location.pathname === '/profile-setup') {return}
    if (!isProfileFilled && !redirectInProgress.current) {
      redirectInProgress.current = true
      navigate('/profile-setup', { replace: true })
    }
  }, [isLoading, user, isProfileFilled, navigate, location.pathname])

  if (isLoading) {return <div>Загрузка...</div>}
  if (!user) {return <div>Пожалуйста, авторизуйтесь...</div>}
  return <Outlet />
}
