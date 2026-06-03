import { trpc } from '../../lib/trpc'

export const useProfileCheck = () => {
  // Делаем всего один запрос к серверу
  const { data: user, isLoading } = trpc.getMe.useQuery()

  // Если данные ещё загружаются или пользователя нет — профиль не считаем заполненным
  if (isLoading || !user?.me) {
    return { user, isLoading, isProfileFilled: false }
  }

  const { title } = user.me

  // Для администратора профиль всегда считается заполненным
  if (title === 'Admin') {
    return { user, isLoading, isProfileFilled: true }
  }

  // Приводим тип к Record<string, any>, чтобы TypeScript не ругался на динамический ключ
  const roleKey = title.toLowerCase() as 'student' | 'teacher' | 'client'
  const userWithProfile = user.me as Record<string, any>
  
  // Проверяем, привязана ли запись профиля (исходя из роли)
  const isProfileFilled = !!userWithProfile[roleKey]

  return { user, isLoading, isProfileFilled }
}