import { useState, useRef, useEffect } from 'react'
import {
  FiMessageSquare,
  FiSend,
  FiChevronDown,
  FiChevronUp,
  FiBookOpen,
  FiLayers,
  FiGrid,
  FiUsers,
  FiCpu,
  FiBriefcase,
  FiUpload,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
} from 'react-icons/fi'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useMe } from '../../../lib/ctx'
import {
  getSignOutRoute,
  getNewDistributionRoute,
  getViewStudentRoute,
  importStudentsRoute,
  getViewDialogueRoute,
  getViewFacultyRoute,
  getViewDepartmentRoute,
  getViewGroupRoute,
} from '../../../lib/routes'
import { trpc } from '../../../lib/trpc'
import { CustomToaster } from '../../CustomToaster'
import css from './index.module.scss'

export const Layout = () => {
  const me = useMe()
  const location = useLocation()

  // --- ЛОГИКА РОЛЕЙ ---
  const isAdmin = me?.role === 'ADMIN'
  const isDeanery = me?.role === 'DEANERY'
  const isTeacher = me?.role === 'TEACHER'
  // Могут управлять контентом только админы и деканат
  const canManage = isAdmin || isDeanery
  // --------------------

  const [isManagementOpen, setIsManagementOpen] = useState(true)
  const [isUserPopupOpen, setIsUserPopupOpen] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const recentChats = trpc.getDialogues.useQuery()
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserPopupOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className={css.layout}>
      <header className={css.mobileHeader}>
        <button onClick={() => setIsMobileOpen(true)} className={css.menuBtn}>
          <FiMenu size={24} />
        </button>
        <div className={css.mobileLogo}>ВКурсе</div>
      </header>

      {isMobileOpen && (
        <div className={css.overlay} onClick={() => setIsMobileOpen(false)} />
      )}

      <aside
        className={`${css.sidebar} ${isMobileOpen ? css.mobileOpen : ''}`}
      >
        <div className={css.sidebarContent}>
          <div className={css.logoArea}>
            <div className={css.logoIcon}>
              <FiBriefcase size={18} />
            </div>
            <span className={css.logoText}>ВКурсе</span>
            <button
              className={css.closeMobileBtn}
              onClick={() => setIsMobileOpen(false)}
            >
              <FiX size={20} />
            </button>
          </div>

          <nav className={css.nav}>
            <Link
              to={
                recentChats.data?.dialogues[0]
                  ? getViewDialogueRoute({
                      dialogueId: recentChats.data.dialogues[0].id,
                    })
                  : '/dialogues' // или любой fallback роут
              }
              className={`${css.navLink} ${location.pathname.startsWith('/dialogue') ? css.active : ''}`}
            >
              <FiMessageSquare className={css.icon} />
              <span>Сообщения</span>
            </Link>

            {/* Рассылки доступны всем сотрудникам, либо ограничьте isAdmin || isDeanery */}
            <Link
              to={getNewDistributionRoute()}
              className={`${css.navLink} ${location.pathname.includes('/distribution') ? css.active : ''}`}
            >
              <FiSend className={css.icon} />
              <span>Рассылки</span>
            </Link>

            {/* Блок управления показываем только Админу и Деканату */}
            {canManage && (
              <div className={css.accordion}>
                <button
                  className={css.accordionTrigger}
                  onClick={() => setIsManagementOpen(!isManagementOpen)}
                >
                  <div className={css.triggerLeft}>
                    <FiLayers className={css.icon} />
                    <span>Управление</span>
                  </div>
                  {isManagementOpen ? <FiChevronUp /> : <FiChevronDown />}
                </button>

                {isManagementOpen && (
                  <div className={css.accordionContent}>
                    <Link
                      to={getViewFacultyRoute()}
                      className={`${css.subLink} ${location.pathname.includes('/facultys') ? css.active : ''}`}
                    >
                      <FiBookOpen size={14} /> Факультеты
                    </Link>
                    <Link
                      to={getViewDepartmentRoute()}
                      className={`${css.subLink} ${location.pathname.includes('/departments') ? css.active : ''}`}
                    >
                      <FiLayers size={14} /> Кафедры
                    </Link>
                    <Link
                      to={getViewGroupRoute()}
                      className={`${css.subLink} ${location.pathname.includes('/groups') ? css.active : ''}`}
                    >
                      <FiGrid size={14} /> Группы
                    </Link>
                    <Link
                      to={getViewStudentRoute()}
                      className={`${css.subLink} ${location.pathname.includes('/students') ? css.active : ''}`}
                    >
                      <FiUsers size={14} /> Студенты
                    </Link>

                    {/* Боты и Сотрудники — только для главного Админа */}
                    {isAdmin && (
                      <>
                        <Link
                          to="/bots"
                          className={`${css.subLink} ${location.pathname.includes('/bots') ? css.active : ''}`}
                        >
                          <FiCpu size={14} /> Боты
                        </Link>
                        <Link
                          to="/deanerys"
                          className={`${css.subLink} ${location.pathname.includes('/deanerys') ? css.active : ''}`}
                        >
                          <FiBriefcase size={14} /> Сотр. деканата
                        </Link>
                        <Link
                          to="/admins"
                          className={`${css.subLink} ${location.pathname.includes('/admins') ? css.active : ''}`}
                        >
                          <FiBriefcase size={14} /> Администраторы
                        </Link>
                        <Link 
                          to="/teachers"
                          className={`${css.subLink} ${location.pathname.includes('/teachers') ? css.active : ''}`}
                        >
                          <FiBriefcase size={14} /> Преподаватели
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className={css.divider} />

            {/* Импорт обычно доступен только админу или деканату */}
            {canManage && (
              <Link
                to={importStudentsRoute()}
                className={`${css.navLink} ${location.pathname.includes('/import-students') ? css.active : ''}`}
              >
                <FiUpload className={css.icon} />
                <span>Импорт</span>
              </Link>
            )}
          </nav>

          <div className={css.footer} ref={userMenuRef}>
            {isUserPopupOpen && (
              <div className={css.userPopup}>
                <Link to="/profile" className={css.popupItem}>
                  <FiUser size={16} /> Профиль
                </Link>
                <Link
                  to={getSignOutRoute()}
                  className={`${css.popupItem} ${css.logout}`}
                >
                  <FiLogOut size={16} /> Выйти
                </Link>
              </div>
            )}
            <div
              className={css.userCard}
              onClick={() => setIsUserPopupOpen(!isUserPopupOpen)}
            >
              <div className={css.avatar}>
                <FiUser />
              </div>
              <div className={css.userMeta}>
                <div className={css.name}>{me?.nick || 'Загрузка...'}</div>
                <div className={css.role}>
                  {isAdmin
                    ? 'Администратор'
                    : isDeanery
                      ? 'Деканат'
                      : isTeacher
                        ? 'Преподаватель'
                        : 'Сотрудник'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className={css.mainContent}>
        <Outlet />
      </main>
      <CustomToaster />
    </div>
  )
}
