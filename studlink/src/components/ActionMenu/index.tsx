import cn from 'classnames'
import { useState, useRef, useEffect } from 'react'
import { FiMoreVertical } from 'react-icons/fi'
import css from './index.module.scss'

export type ActionOption = {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
}

type ActionMenuProps = {
  options: ActionOption[]
}

export const ActionMenu = ({ options }: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom')
  const menuRef = useRef<HTMLDivElement>(null)

  const toggleMenu = () => {
    if (!isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      
      // Если снизу места меньше 200px (высота меню) и сверху места больше, открываем вверх
      if (spaceBelow < 200 && spaceAbove > spaceBelow) {
        setPosition('top')
      } else {
        setPosition('bottom')
      }
    }
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={css.menuContainer} ref={menuRef}>
      <button
        className={cn(css.triggerBtn, { [css.active]: isOpen })}
        onClick={toggleMenu}
        title="Действия"
      >
        <FiMoreVertical />
      </button>

      {isOpen && (
        <div className={cn(css.dropdown, css[position])}>
          {options.map((option, idx) => (
            <button
              key={idx}
              className={cn(css.optionItem, {
                [css.danger]: option.variant === 'danger',
              })}
              onClick={() => {
                option.onClick()
                setIsOpen(false)
              }}
            >
              <span className={css.icon}>{option.icon}</span>
              <span className={css.label}>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}