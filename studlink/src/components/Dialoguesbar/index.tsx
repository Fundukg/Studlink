import { Link, Outlet, useLocation } from 'react-router-dom'
import { getViewDialogueRoute, getViewDialoguesRoute } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const DialoguesBar = () => {
  const { data, isLoading, error } = trpc.getDialogues.useQuery()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className={css.layout}>
        <div className={css.navigation}>
          <div className={css.loading}>
            <div className={css.spinner}></div>
            <p>Загрузка диалогов...</p>
          </div>
        </div>
        <Outlet />
      </div>
    )
  }

  if (error) {
    return (
      <div className={css.layout}>
        <div className={css.navigation}>
          <div className={css.error}>
            <p>Ошибка: {error.message}</p>
          </div>
        </div>
        <Outlet />
      </div>
    )
  }

  if (!data?.dialogues || data.dialogues.length === 0) {
    return (
      <div className={css.layout}>
        <div className={css.navigation}>
          <div className={css.empty}>
            <p>Нет активных диалогов</p>
          </div>
        </div>
        <Outlet />
      </div>
    )
  }

  return (
    <div className={css.layout}>
      <div className={css.navigation}>
        <div className={css.header}>
          <h2>Диалоги</h2>
          <Link className={css.backButton} to={getViewDialoguesRoute()}>
            ← Назад
          </Link>
        </div>
        

        <div className={css.dialogs}>
          {data.dialogues.map((dialogue) => {
            const isActive =
              location.pathname ===
              getViewDialogueRoute({
                dialogueId: dialogue.id,
              })

            return (
              <div key={dialogue.id} className={`${css.dialog} ${isActive ? css.active : ''}`}>
                <Link className={css.dialogLink} to={getViewDialogueRoute({ dialogueId: dialogue.id })}>
                  <div className={css.avatar}>{dialogue.student?.name?.charAt(0) || 'С'}</div>
                  <div className={css.dialogContent}>
                    <div className={css.dialogHeader}>
                      <span className={css.name}>{dialogue.student?.name || 'Студент'}</span>
                      <span className={css.time}>
                        {dialogue.lastMessage.createdAt ? new Date(dialogue.lastMessage.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <div className={css.dialogFooter}>
                      <div className={css.preview}>
                        {dialogue.lastMessage?.text?.substring(0, 60) || 'Нет сообщений'}...
                      </div>
                      {dialogue.messageCount > 0 && (
                        <div className={css.badge}>{dialogue.messageCount > 99 ? '99+' : dialogue.messageCount}</div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
      <Outlet />
    </div>
  )
}
