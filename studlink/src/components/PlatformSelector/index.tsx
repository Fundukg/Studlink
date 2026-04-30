import cn from 'classnames'
import css from './index.module.scss'

// Лучше вынести этот тип в отдельный файл или экспортировать отсюда
export type PlatformType = 'ALL' | 'TELEGRAM' | 'VK' | 'OK'

type Props = {
  value: PlatformType
  dialogue: boolean
  onChange: (value: PlatformType) => void // ИСПРАВЛЕНО: здесь должен быть строгий тип
}

export const PlatformSelector = ({ value, onChange, dialogue }: Props) => {
  const platforms: { id: PlatformType; label: string }[] = [
    { id: 'ALL', label: 'Все' },
    { id: 'TELEGRAM', label: 'Telegram' },
    { id: 'VK', label: 'ВКонтакте' },
    { id: 'OK', label: 'OK' },
  ]

  return (
    <div className={css.container}>
      {platforms.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => {
            onChange(p.id)
            if (dialogue) {
              localStorage.setItem('platform', p.id)
            } else {
              localStorage.setItem('platform_distribution', p.id)
            }
          }}
          className={cn(css.button, { [css.active]: value === p.id })}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
