import { Link, Outlet } from 'react-router-dom'
import { useMe } from '../../lib/ctx'
import { getNewDistributionRoute, getNewStudentRoute, getSignInRoute, getSignOutRoute, getSignUpRoute, getViewStudentRoute, getViewDialoguesRoute } from '../../lib/routes'
import css from './index.module.scss'

export const Layout = () => {
  const me = useMe()

  return (
    <div className={css.layout}>
      <div className={css.navigation}>
        <b className={css.logo}>StudLink</b>
        <ul className={css.menu}>
          <li className={css.item}>
            <Link className={css.link} to={getViewDialoguesRoute()}>
              Диалоги
            </Link>
          </li>
          {me ? (
            <>
              <li className={css.item}>
                <Link className={css.link} to={getNewDistributionRoute()}>
                  Создать рассылку
                </Link>
              </li>
              <li className={css.item}>
                <Link className={css.link} to={getNewStudentRoute()}>
                Добавить студента
                </Link>
              </li>
              <li className={css.item}>
                <Link className={css.link} to={getViewStudentRoute()}>
                  Студенты
                </Link>
              </li>
              <li className={css.item}>
                <Link className={css.link} to={getSignOutRoute()}>
                  Выйти ({me.nick})
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className={css.item}>
                <Link className={css.link} to={getSignUpRoute()}>
                  Sign Up
                </Link>
              </li>
              <li className={css.item}>
                <Link className={css.link} to={getSignInRoute()}>
                  Sign In
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
      <div className={css.content}>
        <Outlet />
      </div>
    </div>
  )
}
