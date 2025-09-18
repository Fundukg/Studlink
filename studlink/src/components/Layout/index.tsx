import { format, isToday } from 'date-fns'
import { useState, type SetStateAction, useRef, useEffect } from 'react'
import {
  FiMessageSquare,
  FiMail,
  FiKey,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiPlus,
  FiBell,
  FiUsers,
} from 'react-icons/fi'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useMe } from '../../lib/ctx'
import { getSignInRoute, getSignOutRoute, getViewDistributionsRoute, getViewDialogueRoute, getNewDistributionRoute } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

// Импортируем иконки из react-icons

export const Layout = () => {
  const recentChats = trpc.getDialogues.useQuery()
  const me = useMe()
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Определяем, является ли устройство мобильным
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900)

  // Обработчик изменения размера окна
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 900
      setIsMobile(mobile)

      // На больших экранах всегда показываем сайдбар
      if (!mobile) {
        setIsMobileOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Закрытие меню пользователя при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }

      // Закрытие сайдбара при клике вне его на мобильных устройствах
      if (isMobile && sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isMobileOpen) {
        setIsMobileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobile, isMobileOpen])

  const toggleSection = (section: SetStateAction<string>) => {
    setActiveSection(activeSection === section ? '' : section)
  }

  const handleDialoguesClick = () => {
    toggleSection('dialogues')

    // Если есть диалоги, переходим к первому
    if (recentChats.data && recentChats.data.distributions.length > 0) {
      navigate(getViewDialogueRoute({ dialogueId: recentChats.data.distributions[0].id }))

      // На мобильных устройствах закрываем сайдбар после выбора
      if (isMobile) {
        setIsMobileOpen(false)
      }
    }
  }

  const formatTime = (dateString: string | number | Date) => {
    const date = new Date(dateString)
    if (isToday(date)) {
      return format(date, 'HH:mm')
    }
    return format(date, 'dd.MM.yy')
  }

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  return (
    <div className={css.layout}>
      {/* Кнопка меню для мобильных устройств */}
      {isMobile && (
        <button className={css.mobileMenuButton} onClick={toggleMobileSidebar} aria-label="Открыть меню">
          {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      )}

      {/* Затемнение фона для мобильных устройств */}
      {isMobile && isMobileOpen && <div className={css.overlay} onClick={() => setIsMobileOpen(false)}></div>}

      <div
        ref={sidebarRef}
        className={`${css.navigation} ${isCollapsed ? css.collapsed : ''} ${isMobile ? css.mobile : ''} ${isMobileOpen ? css.mobileOpen : ''}`}
      >
        <div className={css.header}>
          <div className={css.headerLeft}>
            <div className={css.headerTitles}>
              <h1 className={css.mainTitle}>StudLink</h1>
              <h2 className={css.subTitle}>Student Communication Hub</h2>
            </div>
          </div>

          <div className={css.headerRight}>
            <div className={css.userMenu} ref={userMenuRef}>
              <div className={css.userInfo}>
                <div className={css.avatarPlaceholder} onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                  {me?.nick ? me.nick.charAt(0).toUpperCase() : 'U'}
                </div>
                {me && <FiBell className={css.notificationIcon} size={18} />}
              </div>

              {isUserMenuOpen && (
                <div className={css.dropdownMenu}>
                  <Link to="/profile" className={css.dropdownItem} onClick={() => setIsUserMenuOpen(false)}>
                    <FiUser className={css.dropdownIcon} />
                    Профиль
                  </Link>
                  <Link to="/settings" className={css.dropdownItem} onClick={() => setIsUserMenuOpen(false)}>
                    <FiSettings className={css.dropdownIcon} />
                    Настройки
                  </Link>
                  <Link
                    to={getSignOutRoute()}
                    className={`${css.dropdownItem} ${css.logoutItem}`}
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <FiLogOut className={css.dropdownIcon} />
                    Выйти
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className={css.navContainer}>
          <ul className={css.menu}>
            <li className={css.item}>
              <div
                className={`${css.link} ${activeSection === 'dialogues' ? css.active : ''}`}
                onClick={handleDialoguesClick}
                style={{ cursor: 'pointer' }}
              >
                <FiMessageSquare className={css.icon} />
                <span className={css.text}>Диалоги</span>
              </div>
            </li>
            {me?.nick === 'admin' ? (
              <>
                <li className={css.item}>
                  <Link
                    className={`${css.link} ${location.pathname === getViewDistributionsRoute() ? css.active : ''}`}
                    to={getNewDistributionRoute()}
                    onClick={() => {
                      setActiveSection('')
                      if (isMobile) {
                        setIsMobileOpen(false)
                      }
                    }}
                  >
                    <FiMail className={css.icon} />
                    <span className={css.text}>Рассылки</span>
                  </Link>
                </li>
                <li className={css.item}>
                  <Link
                    className={css.link}
                    to="/users_list"
                    onClick={() => {
                      setActiveSection('')
                      if (isMobile) {
                        setIsMobileOpen(false)
                      }
                    }}
                  >
                    <FiUsers className={css.icon} />
                    <span className={css.text}>Управление</span>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className={css.sectionLabel}>Аутентификация</li>
                <li className={css.item}>
                  <Link
                    className={`${css.link} ${location.pathname === getSignInRoute() ? css.active : ''}`}
                    to={getSignInRoute()}
                    onClick={() => {
                      setActiveSection('')
                      if (isMobile) {
                        setIsMobileOpen(false)
                      }
                    }}
                  >
                    <FiKey className={css.icon} />
                    <span className={css.text}>Вход</span>
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Условное отображение списка диалогов */}
          {!isCollapsed && activeSection === 'dialogues' && (
            <div className={css.dialoguesList}>
              <div className={css.dialoguesHeader}>
                <h3>Recent Chats</h3>
                <button className={css.addButton} title="Создать новый диалог">
                  <FiPlus size={16} />
                </button>
              </div>
              <div className={css.menu}>
                {recentChats.data &&
                  recentChats.data.distributions.map((chat, index) => (
                    <Link
                      key={index}
                      to={getViewDialogueRoute({ dialogueId: chat.id })}
                      onClick={() => {
                        if (isMobile) {
                          setIsMobileOpen(false)
                        }
                      }}
                    >
                      <div className={css.chatItem}>
                        <div className={css.chatAvatar}>{chat.student.name.charAt(0)}</div>
                        <div className={css.chatInfo}>
                          <div className={css.chatName}>{chat.student.name}</div>
                          <div className={css.chatMessage}>{chat.lastMessage.text}</div>
                        </div>
                        <div className={css.chatMeta}>
                          <div className={css.chatTime}>
                            {chat.lastMessage && formatTime(chat.lastMessage.createdAt)}
                          </div>
                          {chat.id > 0 && <div className={css.chatBadge}>{chat.id}</div>}
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </nav>
      </div>
      <div className={`${css.content} ${isMobileOpen ? css.contentShifted : ''}`}>
        <Outlet />
      </div>
    </div>
  )
}
