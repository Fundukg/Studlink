import cn from 'classnames'
import css from './index.module.scss'

type LoaderProps = {
  /** 'fullPage' — растянется на весь экран, 'block' — займет центр родительского контейнера */
  variant?: 'fullPage' | 'block'
  /** Текст под спиннером, если нужен */
  text?: string
}

export const Loader = ({ variant = 'block', text }: LoaderProps) => {
  return (
    <div className={cn(css.loaderContainer, css[variant])}>
      <div className={css.spinnerWrapper}>
        <span className={css.spinner} aria-hidden="true" />
        {/* Декоративный след физкультурного/динамичного стиля СЛИ */}
        <span className={css.pulseCircle} />
      </div>
      {text && <p className={css.text}>{text}</p>}
    </div>
  )
}