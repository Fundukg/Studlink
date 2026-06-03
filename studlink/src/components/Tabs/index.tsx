import cn from 'classnames'
import css from './index.module.scss'

export type TabItem<T extends string> = {
  id: T // Уникальный идентификатор вкладки (например, 'all', 'trainings')
  label: string // Название вкладки (например, 'Все тренировки')
  count?: number // Опциональный счетчик количества элементов
}

type TabsProps<T extends string> = {
  items: TabItem<T>[]
  activeTab: T
  onChange: (tabId: T) => void
  className?: string
}

export const Tabs = <T extends string>({ items, activeTab, onChange, className }: TabsProps<T>) => {
  return (
    <div className={cn(css.tabsContainer, className)}>
      {items.map((item) => {
        const isActive = item.id === activeTab

        return (
          <button
            key={item.id}
            type="button"
            className={cn(css.tabButton, { [css.active]: isActive })}
            onClick={() => onChange(item.id)}
          >
            <span className={css.label}>{item.label}</span>

            {/* Рендерим бадж с количеством, только если передано число */}
            {typeof item.count === 'number' && (
              <span className={cn(css.badge, { [css.activeBadge]: isActive })}>{item.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
