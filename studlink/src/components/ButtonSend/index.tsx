import cn from 'classnames'
import css from './index.module.scss'

export const ButtonSend = ({ children, loading = false }: { children: React.ReactNode; loading?: boolean }) => {
  return (
    <button className={cn({ [css.button]: true, [css.disabled]: loading })} type="submit" disabled={loading}>
      {loading ? 'Загрузка...' : children}
    </button>
  )
}
