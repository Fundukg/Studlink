import cn from 'classnames'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react' // Одиночные импорты Lucide
import { Toaster, resolveValue } from 'react-hot-toast'
import toast from 'react-hot-toast'
import css from './index.module.scss'

export const CustomToaster = () => {
  return (
    <Toaster position="top-right" containerStyle={{ top: 24, right: 24 }}>
      {(t) => {
        // Определяем иконку и цвет в зависимости от типа тоста
        let Icon = Info
        let typeClass = css.info

        if (t.type === 'success') {
          Icon = CheckCircle2
          typeClass = css.success
        } else if (t.type === 'error') {
          Icon = AlertCircle
          typeClass = css.error
        }

        return (
          <div
            className={cn(css.toastCard, typeClass, {
              [css.visible]: t.visible,
            })}
            style={{ ...t.style }}
          >
            {/* Иконка статуса */}
            <div className={css.iconWrapper}>
              <Icon size={20} />
            </div>

            {/* Текст уведомления */}
            <div className={css.message}>{resolveValue(t.message, t)}</div>

            {/* Кнопка закрытия */}
            <button className={css.closeBtn} onClick={() => toast.dismiss(t.id)} aria-label="Закрыть">
              <X size={16} />
            </button>
          </div>
        )
      }}
    </Toaster>
  )
}
