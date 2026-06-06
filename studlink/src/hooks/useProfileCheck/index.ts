import { useMe } from '../../lib/ctx'

export const useProfileCheck = () => {
  const { user, isLoading } = useMe()
  if (isLoading || !user) {return { user, isLoading, isProfileFilled: false }}
  const hasEmail = !!user.email
  const hasPhone = !!user.phone
  const hasChangedPassword = user.firstLogin === true
  return {
    user,
    isLoading,
    isProfileFilled: hasEmail && hasPhone && hasChangedPassword,
  }
}
