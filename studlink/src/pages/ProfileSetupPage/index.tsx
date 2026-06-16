// src/pages/ProfileSetupPage/index.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '../../components/Alert'
import { ProfileForm } from '../../components/ProfileForm'
import { useMe } from '../../lib/ctx'
import { getSignInRoute } from '../../lib/routes'
import css from './index.module.scss'

export const ProfileSetupPage = () => {
  const navigate = useNavigate()
  const { user, isLoading } = useMe()

  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Если профиль загрузился и пользователь админ – уходим на главную
  useEffect(() => {
    if (!isLoading && user?.role === 'ADMIN') {
      navigate('/', { replace: true })
    }
  }, [isLoading, user, navigate])

  if (isLoading) {
    return <div className={css.loader}>Загрузка настройки профиля...</div>
  }

  if (!user) {
    navigate(getSignInRoute(), { replace: true })
    return <div className={css.loader}>Пожалуйста, авторизуйтесь...</div>
  }

  const handleSuccess = () => {
    setMessage({ type: 'success', text: 'Данные успешно сохранены!' })
    setTimeout(() => navigate('/', { replace: true }), 1500)
  }

  return (
    <div className={css.setupContainer}>
      <div className={css.headerText}>
        <h1 className={css.title}>Первоначальная настройка</h1>
        <p className={css.subtitle}>
          Пожалуйста, проверьте личные данные и установите пароль для входа
        </p>
      </div>

      {message && (
        <div className={css.alertWrapper}>
          <Alert color={message.type === 'success' ? 'green' : 'red'}>
            {message.text}
          </Alert>
        </div>
      )}

      {/* Единая карточка с объединенной формой */}
      <div className={css.formCard}>
        <ProfileForm
          mode="setup" // ВАЖНО: Добавьте обработку этого режима в самом ProfileForm
          initialValues={{
            nick: user.nick || '',
            lastName: user.lastName || '',
            firstName: user.firstName || '',
            middleName: user.middleName || '',
            email: user.email || '',
            phone: user.phone || '',
          }}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  )
}
