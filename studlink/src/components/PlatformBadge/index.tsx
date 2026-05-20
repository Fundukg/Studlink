import { FaVk, FaTelegramPlane, FaOdnoklassniki, FaCheck } from 'react-icons/fa'
import css from './index.module.scss'

 type BotPlatform = 'TELEGRAM' | 'VK' | 'OK' | 'ALL'
type Props = {
  platform: BotPlatform | string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showLabel?: boolean // Если нужно вывести текст рядом (например, "VK")
}

export const PlatformBadge = ({
  platform,
  size = 'sm',
  className = '',
  showLabel = false,
}: Props) => {
  const getIcon = () => {
    switch (platform) {
      case 'TELEGRAM':
        return <FaTelegramPlane />
      case 'VK':
        return <FaVk />
      case 'OK':
        return <FaOdnoklassniki />
        case 'ALL':
            return <FaCheck />
      default:
        return null
    }
  }

  // Определяем стиль (цвета берем из твоих правок)
  const platformClass = platform.toLowerCase() // tg, vk, ok

  return (
    <div className={`${css.badgeWrapper} ${className}`}>
      <div className={`${css.badge} ${css[platformClass]} ${css[size]}`}>
        {getIcon()}
      </div>
      {showLabel && <span className={css.labelText}>{platform}</span>}
    </div>
  )
}
