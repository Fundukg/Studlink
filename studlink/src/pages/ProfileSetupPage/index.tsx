// src/pages/ProfileSetupPage/index.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '../../components/Alert'
import { ProfileForm } from '../../components/ProfileForm'
import { useMe } from '../../lib/ctx'
import css from './index.module.scss'

export const ProfileSetupPage = () => {
  const navigate = useNavigate()
  const { user, isLoading } = useMe()  // теперь хук возвращает { user, isLoading }

  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Если профиль загрузился и пользователь админ – уходим (на всякий случай)
  useEffect(() => {
    if (!isLoading && user?.role === 'ADMIN') {
      navigate('/', { replace: true })
    }
  }, [isLoading, user, navigate])

  // Пока загружается – индикатор
  if (isLoading) {
    return <div className={css.loader}>Загрузка...</div>
  }

  // Если по какой-то причине пользователь не определён – заглушка
  if (!user) {
    return <div className={css.loader}>Пожалуйста, авторизуйтесь...</div>
  }

  const handleSuccess = () => {
    setMessage({ type: 'success', text: 'Данные успешно сохранены!' })
    setTimeout(() => navigate('/', { replace: true }), 1500)
  }

  return (
    <div className={css.setupContainer}>
      <h1 className={css.title}>Первоначальная настройка профиля</h1>
      <p className={css.subtitle}>
        Заполните личные данные и установите пароль для входа
      </p>

      {message && (
        <div className={css.alertWrapper}>
          <Alert color={message.type === 'success' ? 'green' : 'red'}>
            {message.text}
          </Alert>
        </div>
      )}

      <div className={css.formCard}>
        <h2 className={css.cardTitle}>📝 Личные данные</h2>
        <ProfileForm
          mode="edit"
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

      <div className={css.formCard}>
        <h2 className={css.cardTitle}>🔒 Безопасность</h2>
        <ProfileForm mode="password" onSuccess={handleSuccess} />
      </div>
    </div>
  )
}