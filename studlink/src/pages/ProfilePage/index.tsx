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
import { ActionMenu, type ActionOption } from '../../components/ActionMenu'
import { Alert } from '../../components/Alert'
import { ProfileForm } from '../../components/ProfileForm'
import { Segment } from '../../components/Segment'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

type ActiveFormTab = 'profile-view' | 'profile-edit' | 'change-password'

export const ProfilePage = () => {
  const { data: userData, isLoading, refetch } = trpc.getMe.useQuery()
  const profile = userData?.me as any
// const profile = { nick: 'test', role: 'ADMIN'}; // статичный объект
// const isLoading = false;
  const [activeForm, setActiveForm] = useState<ActiveFormTab>('profile-view')
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  useEffect(() => {
    if (profile?.role === 'ADMIN') {
      setActiveForm('change-password')
    }
  }, [profile?.role])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [message])

  if (isLoading || !profile) {
    return <div className={css.loader}>Загрузка профиля...</div>
  }

  const fullName =
    `${profile.lastName || ''} ${profile.firstName || ''} ${profile.middleName || ''}`.trim()
  const isAdmin = profile.role === 'ADMIN'
  const isStudent = profile.role === 'STUDENT'
  const isTeacher = profile.role === 'TEACHER'
  const isDeanery = profile.role === 'DEANERY'

  const menuOptions: ActionOption[] = [
    {
      label: 'Просмотр профиля',
      icon: <Settings size={16} />,
      onClick: () => {
        setMessage(null)
        setActiveForm('profile-view')
      },
    },
  ]

  if (!isAdmin) {
    menuOptions.push({
      label: 'Редактировать личные данные',
      icon: <Settings size={16} />,
      onClick: () => {
        setMessage(null)
        setActiveForm('profile-edit')
      },
    })
  }

  menuOptions.push({
    label: 'Безопасность и пароль',
    icon: <Lock size={16} />,
    onClick: () => {
      setMessage(null)
      setActiveForm('change-password')
    },
  })

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
    <Segment title="Мой профиль">
      <div className={css.profilePageWrapper}>
        {!isAdmin && (
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
        )}

        {message && (
          <div className={css.alertWrapper}>
            <Alert color={message.type === 'success' ? 'green' : 'red'}>
              {message.text}
            </Alert>
          </div>
        )}

        <div className={css.profileLayout}>
          {activeForm === 'profile-edit' && !isAdmin && (
            <div
              className={css.fullWidthForm}
              style={{ animation: 'fadeIn 0.3s ease' }}
            >
              <ProfileForm
                mode="edit"
                initialValues={{
                  nick: profile.nick || '',
                  lastName: profile.lastName || '',
                  firstName: profile.firstName || '',
                  middleName: profile.middleName || '',
                  email: profile.email || '',
                  phone: profile.phone || '',
                }}
                onSuccess={async () => {
                  setMessage({
                    type: 'success',
                    text: 'Профиль успешно обновлён!',
                  })
                  setActiveForm('profile-view')
                  await refetch()
                }}
              />
            </div>
          )}

          {activeForm !== 'profile-edit' && (
            <div className={css.verticalStack}>
              {!isAdmin && (
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
                        @{profile.nick || '—'}
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
                        data-role={profile.role.toLowerCase()}
                      >
                        {getRoleName(profile.role)}
                      </span>
                    </div>
                    {profile.email && (
                      <div className={css.infoItem}>
                        <span className={css.infoLabel}>
                          <Mail size={14} /> Email:
                        </span>
                        <span className={css.infoValue}>{profile.email}</span>
                      </div>
                    )}
                    {profile.phone && (
                      <div className={css.infoItem}>
                        <span className={css.infoLabel}>
                          <Phone size={14} /> Телефон:
                        </span>
                        <span className={css.infoValue}>{profile.phone}</span>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {isStudent && profile.student && (
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
                        {profile.student.studentId || '—'}
                      </span>
                    </div>
                    <div className={css.infoItem}>
                      <span className={css.infoLabel}>Курс:</span>
                      <span className={css.infoValue}>
                        {profile.student.course || '—'}
                      </span>
                    </div>
                    <div className={css.infoItem}>
                      <span className={css.infoLabel}>Группа:</span>
                      <span className={css.infoValue}>
                        {profile.student.group?.name || '—'}
                      </span>
                    </div>
                    <div className={css.infoItem}>
                      <span className={css.infoLabel}>Староста:</span>
                      <span className={css.infoValue}>
                        {profile.student.isLeader ? 'Да' : 'Нет'}
                      </span>
                    </div>
                  </div>
                </section>
              )}

              {isTeacher && profile.teacher && (
                <section className={css.infoCardSection}>
                  <div className={css.cardHeader}>
                    <h2 className={css.cardTitle}>Преподавательские данные</h2>
                    <span className={css.cardIcon}>
                      <BookOpen size={24} />
                    </span>
                  </div>
                  <div className={css.infoGrid}>
                    {profile.teacher.subjects && (
                      <div className={css.infoItem}>
                        <span className={css.infoLabel}>Предметы:</span>
                        <span className={css.infoValue}>
                          {typeof profile.teacher.subjects === 'object'
                            ? Object.keys(profile.teacher.subjects).join(', ')
                            : profile.teacher.subjects}
                        </span>
                      </div>
                    )}
                    <div className={css.infoItemFull}>
                      <span className={css.infoLabel}>
                        Закреплённые группы:
                      </span>
                      <div className={css.groupList}>
                        {profile.teacher.assignments?.length > 0 ? (
                          profile.teacher.assignments.map((a: any) => (
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

              {isDeanery && profile.deanery && (
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
                        {profile.deanery.faculty?.name || '—'}
                      </span>
                    </div>
                  </div>
                </section>
              )}

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
                      if (!isAdmin) {
                        setActiveForm('profile-view')
                      }
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
