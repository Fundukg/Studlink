// src/pages/ProfilePage/index.tsx
import {
  Lock,
  Settings,
  ChevronDown,
  User,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  Building,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionMenu, type ActionOption } from '../../components/ActionMenu'
import { Alert } from '../../components/Alert'
import { ProfileForm } from '../../components/ProfileForm'
import { Segment } from '../../components/Segment'
import { useMe } from '../../lib/ctx'
import { getSignInRoute } from '../../lib/routes'
import css from './index.module.scss'

type ActiveFormTab = 'userData-view' | 'userData-edit' | 'change-password'

export const ProfilePage = () => {
  const { user: userData, isLoading } = useMe() // теперь получаем user и isLoading
  const navigate = useNavigate()
  const [activeForm, setActiveForm] = useState<ActiveFormTab>('userData-view')
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Автоочистка сообщений
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Показываем загрузку
  if (isLoading) {
    return <div className={css.loader}>Загрузка...</div>
  }

  // Если пользователь не определён — просим авторизоваться
  if (!userData) {
    navigate(getSignInRoute(), { replace: true })
    return <div className={css.loader}>Пожалуйста, авторизуйтесь...</div>
  }
  const fullName =
    `${userData.lastName || ''} ${userData.firstName || ''} ${userData.middleName || ''}`.trim()
  const isStudent = userData.role === 'STUDENT'
  const isTeacher = userData.role === 'TEACHER'
  const isDeanery = userData.role === 'DEANERY'

  // Меню действий — теперь доступно всем, включая админа
  const menuOptions: ActionOption[] = [
    {
      label: 'Просмотр профиля',
      icon: <Settings size={16} />,
      onClick: () => {
        setMessage(null)
        setActiveForm('userData-view')
      },
    },
    {
      label: 'Редактировать личные данные',
      icon: <Settings size={16} />,
      onClick: () => {
        setMessage(null)
        setActiveForm('userData-edit')
      },
    },
    {
      label: 'Безопасность и пароль',
      icon: <Lock size={16} />,
      onClick: () => {
        setMessage(null)
        setActiveForm('change-password')
      },
    },
  ]

  const getRoleName = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return 'Студент'
      case 'TEACHER':
        return 'Преподаватель'
      case 'DEANERY':
        return 'Деканат'
      case 'ADMIN':
        return 'Администратор'
      default:
        return role
    }
  }

  return (
    <Segment title="Мой профиль" size={2}>
      <div className={css.userDataPageWrapper}>
        {/* Меню управления профилем показывается всем */}
        <div className={css.actionsHeader}>
          <ActionMenu
            align="right"
            trigger={
              <button className={css.menuTriggerButton}>
                Управление профилем{' '}
                <ChevronDown size={16} style={{ marginLeft: '6px' }} />
              </button>
            }
            options={menuOptions}
          />
        </div>

        {message && (
          <div className={css.alertWrapper}>
            <Alert color={message.type === 'success' ? 'green' : 'red'}>
              {message.text}
            </Alert>
          </div>
        )}

        <div className={css.userDataLayout}>
          {/* Форма редактирования (доступна всем) */}
          {activeForm === 'userData-edit' && (
            <div
              className={css.fullWidthForm}
              style={{ animation: 'fadeIn 0.3s ease' }}
            >
              <ProfileForm
                mode="edit"
                initialValues={{
                  nick: userData.nick || '',
                  lastName: userData.lastName || '',
                  firstName: userData.firstName || '',
                  middleName: userData.middleName || '',
                  email: userData.email || '',
                  phone: userData.phone || '',
                }}
                onSuccess={async () => {
                  setMessage({
                    type: 'success',
                    text: 'Профиль успешно обновлён!',
                  })
                  setActiveForm('userData-view')
                }}
              />
            </div>
          )}

          {/* Основной просмотр или смена пароля */}
          {activeForm !== 'userData-edit' && (
            <div className={css.verticalStack}>
              {/* Общая информация — теперь видна и админу */}
              <section className={css.infoCardSection}>
                <div className={css.cardHeader}>
                  <h2 className={css.cardTitle}>Общая информация</h2>
                  <span className={css.cardIcon}>
                    <User size={24} />
                  </span>
                </div>
                <div className={css.infoGrid}>
                  <div className={css.infoItem}>
                    <span className={css.infoLabel}>Логин (ник):</span>
                    <span className={css.infoValue}>
                      @{userData.nick || '—'}
                    </span>
                  </div>
                  <div className={css.infoItem}>
                    <span className={css.infoLabel}>ФИО:</span>
                    <span className={css.infoValue}>{fullName || '—'}</span>
                  </div>
                  <div className={css.infoItem}>
                    <span className={css.infoLabel}>Роль:</span>
                    <span
                      className={css.infoValue}
                      data-role={userData.role.toLowerCase()}
                    >
                      {getRoleName(userData.role)}
                    </span>
                  </div>
                  {userData.email && (
                    <div className={css.infoItem}>
                      <span className={css.infoLabel}>
                        <Mail size={14} /> Email:
                      </span>
                      <span className={css.infoValue}>{userData.email}</span>
                    </div>
                  )}
                  {userData.phone && (
                    <div className={css.infoItem}>
                      <span className={css.infoLabel}>
                        <Phone size={14} /> Телефон:
                      </span>
                      <span className={css.infoValue}>{userData.phone}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Секции ролей (только при их наличии) */}
              {isStudent && userData.student && (
                <section className={css.infoCardSection}>
                  <div className={css.cardHeader}>
                    <h2 className={css.cardTitle}>Студенческие данные</h2>
                    <span className={css.cardIcon}>
                      <GraduationCap size={24} />
                    </span>
                  </div>
                  <div className={css.infoGrid}>
                    <div className={css.infoItem}>
                      <span className={css.infoLabel}>Номер зачётки:</span>
                      <span className={css.infoValue}>
                        {userData.student.studentId || '—'}
                      </span>
                    </div>
                    <div className={css.infoItem}>
                      <span className={css.infoLabel}>Курс:</span>
                      <span className={css.infoValue}>
                        {userData.student.course || '—'}
                      </span>
                    </div>
                    <div className={css.infoItem}>
                      <span className={css.infoLabel}>Группа:</span>
                      <span className={css.infoValue}>
                        {userData.student.group?.name || '—'}
                      </span>
                    </div>
                    <div className={css.infoItem}>
                      <span className={css.infoLabel}>Староста:</span>
                      <span className={css.infoValue}>
                        {userData.student.isLeader ? 'Да' : 'Нет'}
                      </span>
                    </div>
                  </div>
                </section>
              )}

              {isTeacher && userData.teacher && (
                <section className={css.infoCardSection}>
                  <div className={css.cardHeader}>
                    <h2 className={css.cardTitle}>Преподавательские данные</h2>
                    <span className={css.cardIcon}>
                      <BookOpen size={24} />
                    </span>
                  </div>
                  <div className={css.infoGrid}>
                    {userData.teacher.subjects && (
                      <div className={css.infoItem}>
                        <span className={css.infoLabel}>Предметы:</span>
                        <span className={css.infoValue}>
                          {typeof userData.teacher.subjects === 'object'
                            ? Object.keys(userData.teacher.subjects).join(', ')
                            : userData.teacher.subjects}
                        </span>
                      </div>
                    )}
                    <div className={css.infoItemFull}>
                      <span className={css.infoLabel}>
                        Закреплённые группы:
                      </span>
                      <div className={css.groupList}>
                        {userData.teacher.assignments?.length > 0 ? (
                          userData.teacher.assignments.map((a: any) => (
                            <span key={a.group.id} className={css.groupBadge}>
                              {a.group.name}{' '}
                              {a.roleInGroup && `(${a.roleInGroup})`}
                            </span>
                          ))
                        ) : (
                          <span className={css.infoValue}>—</span>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {isDeanery && userData.deanery && (
                <section className={css.infoCardSection}>
                  <div className={css.cardHeader}>
                    <h2 className={css.cardTitle}>Деканат</h2>
                    <span className={css.cardIcon}>
                      <Building size={24} />
                    </span>
                  </div>
                  <div className={css.infoGrid}>
                    <div className={css.infoItem}>
                      <span className={css.infoLabel}>Факультет:</span>
                      <span className={css.infoValue}>
                        {userData.deanery.faculty?.name || '—'}
                      </span>
                    </div>
                  </div>
                </section>
              )}

              {/* Форма смены пароля (доступна всегда) */}
              {activeForm === 'change-password' && (
                <div
                  className={css.bottomFormWrapper}
                  style={{ animation: 'slideDown 0.3s ease' }}
                >
                  <ProfileForm
                    mode="password"
                    onSuccess={() => {
                      setMessage({
                        type: 'success',
                        text: 'Пароль успешно изменён!',
                      })
                      // После смены пароля возвращаемся к просмотру профиля (для всех ролей)
                      setActiveForm('userData-view')
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Segment>
  )
}
