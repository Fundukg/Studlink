import cn from 'classnames'
import css from './index.module.scss'

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
