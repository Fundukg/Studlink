import { motion, AnimatePresence } from 'framer-motion'
import { type ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FiX } from 'react-icons/fi'
import css from './index.module.scss'

type Props = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  maxWidth?: number // Возможность менять ширину (например, 500 для профиля, 800 для чата)
}

export const UniversalModal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 500,
}: Props) => {
  // Закрытие по ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {onClose()}
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className={css.overlay}>
          {/* Фон при клике на который закрывается окно */}
          <motion.div
            className={css.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Само окно */}
          <motion.div
            className={css.modalContainer}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{ maxWidth: `${maxWidth}px` }}
          >
            <header className={css.header}>
              <h3>{title}</h3>
              <button onClick={onClose} className={css.closeBtn}>
                <FiX size={20} />
              </button>
            </header>

            <div className={css.body}>{children}</div>

            {footer && <footer className={css.footer}>{footer}</footer>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
