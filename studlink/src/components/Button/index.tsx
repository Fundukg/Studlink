import cn from 'classnames'
import { type ButtonHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import css from './index.module.scss'

export type ButtonProps1 = { children: React.ReactNode; loading?: boolean }
export const ButtonSend = ({
  children,
  loading = false,
  className,
  form,
}: {
  children: React.ReactNode
  loading?: boolean
  className?: string
  form?: string
}) => {
  return (
    <button form={form} className={className} type="submit" disabled={loading}>
      {loading ? 'Загрузка...' : children}
    </button>
  )
}
//cn({ [css.button]: true, [css.disabled]: loading, className })
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
    <button
      className={cn({ [css.button]: true }, props.className)}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}

export const ButtomLink = ({
  children,
  to,
}: {
  children: React.ReactNode
  to: string
}) => {
  return (
    <Link className={cn({ [css.button]: true })} to={to}>
      {children}
    </Link>
  )
}

type ButtonProps = {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>

export const Button = ({
  children,
  variant = 'primary', // По умолчанию кнопка будет зеленой (брендовой)
  loading = false,
  className,
  type = 'button', // По умолчанию 'button', чтобы случайно не отправлять формы, если кнопка внутри тега <form>
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      className={cn(css.button, css[variant], className, {
        [css.loading]: loading,
      })}
    >
      {loading ? (
        <>
          <span className={css.spinner} aria-hidden="true" />
          <span>Загрузка...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
