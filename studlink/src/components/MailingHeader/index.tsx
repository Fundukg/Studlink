import { FiEye, FiSend } from 'react-icons/fi'
import { Link, useLocation } from 'react-router-dom'
import { getNewDistributionRoute, getViewDistributionsRoute } from '../../lib/routes'
import css from './index.module.scss'

export const MailingHeader = () => {
  const location = useLocation()

  return (
    <header className={css.header}>
      <div className={css.headerContent}>
        <div className={css.headerTop}>
          <h1 className={css.title}>Система рассылки</h1>
          <p className={css.subtitle}>Управление уведомлениями и сообщениями</p>
        </div>

        <nav className={css.navTabs}>
          <Link
            to={getNewDistributionRoute()}
            className={`${css.tab} ${
              location.pathname === getNewDistributionRoute() ? css.activeTab : ''
            }`}
          >
            <FiSend className={css.icon} />
            <span className={css.tabText}>Написать письмо</span>
          </Link>
          <Link
            to={getViewDistributionsRoute()}
            className={`${css.tab} ${
              location.pathname === getViewDistributionsRoute() ? css.activeTab : ''
            }`}
          >
            <FiEye className={css.icon} />
            <span className={css.tabText}>История рассылок</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}