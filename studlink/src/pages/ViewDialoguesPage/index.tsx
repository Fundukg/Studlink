import { format, isToday } from 'date-fns'
import { Link } from 'react-router-dom'
import { withPageWrapper } from '../../lib/pageWarpper'
import { getViewDialogueRoute } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const ViewDialoguesPage = withPageWrapper({
  useQuery: () => trpc.getDialogues.useQuery(),
  setProps: ({ queryResult }) => ({
    dialogues: queryResult.data!,
  }),
})(({ dialogues }) => {
  const formatTime = (dateString: string | number | Date) => {
    const date = new Date(dateString)
    if (isToday(date)) {
      return format(date, 'HH:mm')
    }
    return format(date, 'dd.MM.yy')
  }

  return (
    <div className={css.container}>
      <div className={css.header}>
        <h1 className={css.title}>Диалоги</h1>
        <div className={css.search}>
          <input 
            type="text" 
            placeholder="Поиск диалогов..." 
            className={css.searchInput}
          />
          <button className={css.searchButton}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className={css.dialogList}>
        {dialogues.distributions.map((dialogue) => (
          <Link
            key={dialogue.id}
            to={getViewDialogueRoute({ dialogueId: dialogue.id })}
            className={css.dialogItem}
          >
            <div className={css.avatar}>
              {dialogue.student.name.charAt(0)}
            </div>
            
            <div className={css.dialogContent}>
              <div className={css.dialogHeader}>
                <h3 className={css.studentName}>
                  {dialogue.student.name}
                  <span className={css.studentId}>#{dialogue.student.studentId}</span>
                </h3>
                <span className={css.time}>
                  {dialogue.lastMessage && formatTime(dialogue.lastMessage.createdAt)}
                </span>
              </div>
              
              <div className={css.messagePreview}>
                <p className={css.messageText}>
                  {dialogue.lastMessage 
                    ? dialogue.lastMessage.text.substring(0, 80) + (dialogue.lastMessage.text.length > 80 ? '...' : '')
                    : 'Нет сообщений'
                  }
                </p>
                {dialogue.messageCount > 0 && (
                  <div className={css.messageBadge}>
                    {dialogue.messageCount > 99 ? '99+' : dialogue.messageCount}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
})