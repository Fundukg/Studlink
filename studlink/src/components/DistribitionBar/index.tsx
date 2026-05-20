import { Link, Outlet, useLocation } from 'react-router-dom'
import { getViewDialoguesRoute, getViewDistributionRoute } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const DistribitionBar = () => {
  const { data, isLoading, error } = trpc.getDistributions.useQuery()
  const location = useLocation()
  
  if (isLoading) {
    return (
      <div className={css.layout}>
        <div className={css.navigation}>
          <div className={css.loading}>
            <div className={css.spinner}></div>
            <p>Загрузка рассылок...</p>
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
  
  if (!data?.distributions || data.distributions.length === 0) {
    return (
      <div className={css.layout}>
        <div className={css.navigation}>
          <div className={css.empty}>
            <p>Нет доступных рассылок</p>
            <Link className={css.backButton} to={getViewDialoguesRoute()}>
              Назад к диалогам
            </Link>
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
          <h2>Рассылки</h2>
          <Link className={css.backButton} to={getViewDialoguesRoute()}>
            ← Назад
          </Link>
        </div>
        
        <div className={css.dialogs}>
          {data.distributions.map((distribution) => {
            const isActive = location.pathname === getViewDistributionRoute({ 
              distributionId: distribution.id 
            })
            
            return (
              <div 
                key={distribution.id} 
                className={`${css.dialog} ${isActive ? css.active : ''}`}
              >
                <Link
                  className={css.dialogLink}
                  to={getViewDistributionRoute({ distributionId: distribution.id })}
                >
                  <div className={css.avatar}>
                    {distribution.targetType?.charAt(0) || 'Р'}
                  </div>
                  <div className={css.dialogContent}>
                    <div className={css.dialogHeader}>
                      <span className={css.recipient}>{distribution.targetType}</span>
                      <span className={css.time}>
                        {distribution.createdAt 
                          ? new Date(distribution.createdAt).toLocaleDateString() 
                          : ''
                        }
                      </span>
                    </div>
                    <div className={css.preview}>
                      {distribution.text?.substring(0, 60) || 'Без текста'}...
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