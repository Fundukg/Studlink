import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useProfileCheck } from '../../hooks/useProfileCheck'
import { getSignInRoute } from '../../lib/routes';

type Props = {
  children: React.ReactNode
}

export const SetupProfileRoute = ({ children }: Props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isLoading, isProfileFilled } = useProfileCheck()
  const redirectInProgress = useRef(false)

  useEffect(() => {
    // 1. Не действуем, пока идёт загрузка пользователя
    if (isLoading) {return}

    // 2. Если пользователь не авторизован (не должен сюда попасть), ничего не делаем
    if (!user) {return}

    // 3. Если профиль заполнен – перенаправляем на главную
    if (isProfileFilled) {
      // Только если мы не в процессе навигации и не находимся уже на корневом пути
      if (!redirectInProgress.current && location.pathname !== '/') {
        redirectInProgress.current = true
        navigate('/', { replace: true })
      }
    }
  }, [isLoading, user, isProfileFilled, navigate, location.pathname])

  // Пока загружаемся – показываем лоадер
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        Загрузка...
      </div>
    )
  }

  // Если пользователь не найден – просим авторизоваться
  if (!user) {
    navigate(getSignInRoute(), { replace: true })
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        Пожалуйста, авторизуйтесь...
      </div>
    )
  }

  // Профиль не заполнен – показываем страницу настройки профиля (children)
  return <>{children}</>
}
