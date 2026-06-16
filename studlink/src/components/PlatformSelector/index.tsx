import cn from 'classnames'
import type { JSX } from 'react'
import { FaGlobe, FaTelegram, FaVk, FaOdnoklassniki } from 'react-icons/fa' // Импорт иконок
import css from './index.module.scss'

export type PlatformType = 'ALL' | 'TELEGRAM' | 'VK' | 'OK'

type Props = {
  value: PlatformType
  dialogue: boolean
  onChange: (value: PlatformType) => void
  availablePlatforms?: PlatformType[]
}

export const PlatformSelector = ({
  value,
  onChange,
  dialogue,
  availablePlatforms,
}: Props) => {
  const platforms: { id: PlatformType; label: string; icon: JSX.Element }[] = [
    { id: 'ALL', label: 'Все', icon: <FaGlobe /> },
    { id: 'TELEGRAM', label: 'Telegram', icon: <FaTelegram /> },
    { id: 'VK', label: 'ВКонтакте', icon: <FaVk /> },
    { id: 'OK', label: 'OK', icon: <FaOdnoklassniki /> },
  ]

  return (
    <div className={css.container}>
      {platforms.map((p) => {
        const isAvailable =
          p.id === 'ALL' ||
          !availablePlatforms ||
          availablePlatforms.includes(p.id)

        return (
          <button
            key={p.id}
            type="button"
            data-platform={p.id}
            disabled={!isAvailable}
            onClick={() => {
              onChange(p.id)
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              dialogue
                ? localStorage.setItem('platform', p.id)
                : localStorage.setItem('platform_distribution', p.id)
            }}
            className={cn(css.button, {
              [css.active]: value === p.id,
              [css.disabled]: !isAvailable,
            })}
          >
            <span className={css.icon}>{p.icon}</span>
            <span className={css.label}>{p.label}</span>
          </button>
        )
      })}
    </div>
  )
}
