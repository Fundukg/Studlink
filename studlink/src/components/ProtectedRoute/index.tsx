// components/ProtectedRoute.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { trpc } from '../../lib/trpc'

type Props = {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: Props) => {
  const navigate = useNavigate()

  const { data: userData, isLoading } = trpc.getMe.useQuery()

  useEffect(() => {
    if (isLoading || !userData?.me) {
      return
    }

    const { title } = userData.me

    if (title === 'Admin') {
      return
    }

    const roleKey = title.toLowerCase() as 'ADMIN' | 'TEACHER' | 'DEANERY'

    // Явно приводим userData.me к Record<string, any>, чтобы TS разрешил динамический поиск по ключу
    const userWithProfile = userData.me as Record<string, any>
    const hasProfile = !!userWithProfile[roleKey]

    if (!hasProfile) {
      navigate('/profile-setup')
    }
  }, [userData, isLoading, navigate])

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

  if (!userData?.me) {
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

  const { title } = userData.me

  if (title === 'Admin') {
    return <>{children}</>
  }

  const roleKey = title.toLowerCase() as 'ADMIN' | 'TEACHER' | 'DEANERY'

  // Аналогично приводим тип здесь для безопасного финального рендера
  const userWithProfile = userData.me as Record<string, any>

  if (userWithProfile[roleKey]) {
    return <>{children}</>
  }

  return null
}
