import cn from 'classnames'
import { Link } from 'react-router-dom';
import css from './index.module.scss'

export const ButtonSend = ({ children, loading = false }: { children: React.ReactNode; loading?: boolean }) => {
  return (
    <button className={cn({ [css.button]: true, [css.disabled]: loading })} type="submit" disabled={loading}>
      {loading ? 'Загрузка...' : children}
    </button>
  )
}

export const ButtonSelect = ({
  children,
  type = 'button',
  ...props
}: {
  children: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  [props: string]: any
}) => {
  return (
    <button  className={cn({ [css.button]: true }, props.className)} type={type} {...props}>
      {children}
    </button>
  )
}

export const ButtomLink = ({ children, to }: { children: React.ReactNode; to: string }) => {
  return (
    <Link className={cn({ [css.button]: true })} to={to}>
      {children}
    </Link>
  )
}