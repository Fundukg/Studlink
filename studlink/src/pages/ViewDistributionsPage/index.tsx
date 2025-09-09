import { format, isToday } from 'date-fns'
import { Link } from 'react-router-dom'
import { withPageWrapper } from '../../lib/pageWarpper'
import { getViewDistributionRoute } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const ViewDistributionsPage = withPageWrapper({
  useQuery: () => trpc.getDistributions.useQuery(),
  setProps: ({ queryResult }) => ({
    distributions: queryResult.data!,
  }),
})(({ distributions }) => {
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
        <h1 className={css.title}>Рассылки</h1>
        <div className={css.search}>
          <input 
            type="text" 
            placeholder="Поиск рассылок..." 
            className={css.searchInput}
          />
          <button className={css.searchButton}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className={css.distributionList}>
        {distributions.distributions.map((distribution) => (
          <Link
            key={distribution.id}
            to={getViewDistributionRoute({ distributionId: distribution.id })}
            className={css.distributionItem}
          >
            <div className={css.icon}>
              📧
            </div>
            
            <div className={css.distributionContent}>
              <div className={css.distributionHeader}>
                <h3 className={css.recipient}>
                  {distribution.recipient}
                </h3>
                <span className={css.time}>
                  {distribution.createdAt && formatTime(distribution.createdAt)}
                </span>
              </div>
              
              <div className={css.messagePreview}>
                <p className={css.messageText}>
                  {distribution.text 
                    ? distribution.text.substring(0, 80) + (distribution.text.length > 80 ? '...' : '')
                    : 'Нет текста'
                  }
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
})