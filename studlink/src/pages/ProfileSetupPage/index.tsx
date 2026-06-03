// src/pages/ProfileSetupPage/index.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '../../components/Alert'
import { ProfileForm } from '../../components/ProfileForm'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const ProfileSetupPage = () => {
  const navigate = useNavigate()
  const { data: userData, isLoading, refetch } = trpc.getMe.useQuery()
  const profile = userData?.me as any
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  useEffect(() => {
    if (isLoading || !profile) {return}

    // Админов перенаправляем, им не нужна настройка
    if (profile.role === 'ADMIN') {
      navigate('/')
    }
  }, [profile, isLoading, navigate])

  if (isLoading || !profile) {
    return <div className={css.loader}>Загрузка...</div>
  }

  const handleSuccess = async () => {
    await refetch()
    setMessage({ type: 'success', text: 'Данные успешно сохранены!' })
    setTimeout(() => navigate('/'), 1500)
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
            nick: profile.nick || '',
            lastName: profile.lastName || '',
            firstName: profile.firstName || '',
            middleName: profile.middleName || '',
            email: profile.email || '',
            phone: profile.phone || '',
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
