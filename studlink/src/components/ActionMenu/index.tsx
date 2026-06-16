import cn from 'classnames'
import { useState, useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
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
  align?: 'left' | 'right'
  trigger?: ReactNode
}

export const ActionMenu = ({
  options,
  align = 'left',
  trigger,
}: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isRendered, setIsRendered] = useState(false) // Для контроля анимации появления
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom')
  const [currentAlign, setCurrentAlign] = useState<'left' | 'right'>(align)
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  const menuRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleMenu = (e?: React.MouseEvent) => {
    if (e) {e.stopPropagation()}

    if (!isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()

      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const newPosition =
        spaceBelow < 200 && spaceAbove > spaceBelow ? 'top' : 'bottom'

      const spaceRight = window.innerWidth - rect.right
      const newAlign = spaceRight < 200 ? 'right' : align

      setPosition(newPosition)
      setCurrentAlign(newAlign)
      setCoords({
        top: newPosition === 'bottom' ? rect.bottom + 4 : rect.top - 4,
        left: newAlign === 'left' ? rect.left : rect.right,
      })

      setIsOpen(true)
      // Задержка перед отображением, чтобы координаты успели примениться
      requestAnimationFrame(() => setIsRendered(true))
    } else {
      setIsOpen(false)
      setIsRendered(false)
    }
  }

  // Эффекты (клик вне, скролл) остаются прежними...
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        (!dropdownRef.current ||
          !dropdownRef.current.contains(event.target as Node))
      ) {
        setIsOpen(false)
        setIsRendered(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={css.menuContainer} ref={menuRef}>
      {trigger ? (
        <div onClick={toggleMenu} className={css.customTrigger}>
          {trigger}
        </div>
      ) : (
        <button
          className={cn(css.triggerBtn, { [css.active]: isOpen })}
          onClick={toggleMenu}
        >
          <FiMoreVertical />
        </button>
      )}

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className={cn(css.dropdown, css[position], css[currentAlign])}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 9999,
              opacity: isRendered ? 1 : 0, // Не показываем, пока не рассчитано
              transform: `translate(${currentAlign === 'right' ? '-100%' : '0'}, ${position === 'top' ? '-100%' : '0'})`,
            }}
          >
            {options.map((option, idx) => (
              <button
                key={idx}
                className={cn(css.optionItem, {
                  [css.danger]: option.variant === 'danger',
                })}
                onClick={(e) => {
                  e.stopPropagation()
                  option.onClick()
                  setIsOpen(false)
                  setIsRendered(false)
                }}
              >
                <span className={css.icon}>{option.icon}</span>
                <span className={css.label}>{option.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  )
}
