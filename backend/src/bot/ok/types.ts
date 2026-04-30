export type IQuickReply = {
  label: string // Текст, который увидит пользователь на кнопке
  payload: string // Данные, которые придут боту при нажатии (скрыто от юзера)
  color?: 'primary' | 'positive' | 'negative' | 'default'
}
