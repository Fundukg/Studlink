import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useMe } from '../../lib/ctx'
import {
  getNewDistributionRoute,
  getNewStudentRoute,
  getSignInRoute,
  getSignOutRoute,
  getSignUpRoute,
  getViewStudentRoute,
  getViewDialoguesRoute,
  getViewDistributionsRoute,
  getNewFacultyRoute,
  getNewDepartmentRoute,
  getNewGroupRoute,
} from '../../lib/routes'
import css from './index.module.scss'

export const Layout = () => {
  const me = useMe()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={css.layout}>
      <div className={`${css.navigation} ${isCollapsed ? css.collapsed : ''}`}>
        <div className={css.header}>
          <b className={css.logo}>StudLink</b>
          <button 
            className={css.toggleButton}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Развернуть меню' : 'Свернуть меню'}
          >
            <span className={css.toggleIcon}></span>
          </button>
        </div>
        
        <nav className={css.navContainer}>
          <ul className={css.menu}>
            <li className={css.item}>
              <Link 
                className={`${css.link} ${location.pathname === getViewDialoguesRoute() ? css.active : ''}`} 
                to={getViewDialoguesRoute()}
              >
                <span className={css.icon}>💬</span>
                <span className={css.text}>Диалоги</span>
              </Link>
            </li>
            {me ? (
              <>
                <li className={css.sectionLabel}>Администрирование</li>
                <li className={css.item}>
                  <Link 
                    className={`${css.link} ${location.pathname === getNewDistributionRoute() ? css.active : ''}`} 
                    to={getNewDistributionRoute()}
                  >
                    <span className={css.icon}>📤</span>
                    <span className={css.text}>Создать рассылку</span>
                  </Link>
                </li>
                <li className={css.item}>
                  <Link 
                    className={`${css.link} ${location.pathname === getViewDistributionsRoute() ? css.active : ''}`} 
                    to={getViewDistributionsRoute()}
                  >
                    <span className={css.icon}>📨</span>
                    <span className={css.text}>Рассылки</span>
                  </Link>
                </li>
                <li className={css.item}>
                  <Link 
                    className={`${css.link} ${location.pathname === getNewStudentRoute() ? css.active : ''}`} 
                    to={getNewStudentRoute()}
                  >
                    <span className={css.icon}>👨‍🎓</span>
                    <span className={css.text}>Добавить студента</span>
                  </Link>
                </li>
                <li className={css.item}>
                  <Link 
                    className={`${css.link} ${location.pathname === getNewFacultyRoute() ? css.active : ''}`} 
                    to={getNewFacultyRoute()}
                  >
                    <span className={css.icon}>🏛️</span>
                    <span className={css.text}>Добавить факультет</span>
                  </Link>
                </li>
                <li className={css.item}>
                  <Link 
                    className={`${css.link} ${location.pathname === getNewDepartmentRoute() ? css.active : ''}`} 
                    to={getNewDepartmentRoute()}
                  >
                    <span className={css.icon}>📚</span>
                    <span className={css.text}>Добавить кафедру</span>
                  </Link>
                </li>
                <li className={css.item}>
                  <Link 
                    className={`${css.link} ${location.pathname === getNewGroupRoute() ? css.active : ''}`} 
                    to={getNewGroupRoute()}
                  >
                    <span className={css.icon}>👥</span>
                    <span className={css.text}>Добавить группу</span>
                  </Link>
                </li>
                <li className={css.item}>
                  <Link 
                    className={`${css.link} ${location.pathname === getViewStudentRoute() ? css.active : ''}`} 
                    to={getViewStudentRoute()}
                  >
                    <span className={css.icon}>📊</span>
                    <span className={css.text}>Студенты</span>
                  </Link>
                </li>
                
                <li className={css.sectionLabel}>Аккаунт</li>
                <li className={css.item}>
                  <Link 
                    className={`${css.link} ${location.pathname === getSignOutRoute() ? css.active : ''}`} 
                    to={getSignOutRoute()}
                  >
                    <span className={css.icon}>🚪</span>
                    <span className={css.text}>Выйти ({me.nick})</span>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className={css.sectionLabel}>Аутентификация</li>
                <li className={css.item}>
                  <Link 
                    className={`${css.link} ${location.pathname === getSignUpRoute() ? css.active : ''}`} 
                    to={getSignUpRoute()}
                  >
                    <span className={css.icon}>📝</span>
                    <span className={css.text}>Регистрация</span>
                  </Link>
                </li>
                <li className={css.item}>
                  <Link 
                    className={`${css.link} ${location.pathname === getSignInRoute() ? css.active : ''}`} 
                    to={getSignInRoute()}
                  >
                    <span className={css.icon}>🔑</span>
                    <span className={css.text}>Вход</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
      <div className={css.content}>
        <Outlet />
      </div>
    </div>
  )
}