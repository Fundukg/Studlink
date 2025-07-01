import { Link, Outlet } from 'react-router-dom'
import { getNewDistributionRoute, getWorkDeskRoute } from '../../lib/routes'
import css from './index.module.scss'

export const Layout = () => {
  return (
    <div className={css.layout}>
      <div className={css.navigation}>
        <b className={css.logo}>StudLink</b>
        <ul className={css.menu}>
          <li className={css.item}>
            <Link className={css.link} to={getWorkDeskRoute()}>
              Work Desk
            </Link>
          </li>
          <li className={css.item}>
            <Link className={css.link} to={getNewDistributionRoute()}>
              New Distribution
            </Link>
          </li>
        </ul>
      </div>
      <div className={css.content}>
        <Outlet />
      </div>
    </div>
  )
}
