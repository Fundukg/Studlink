import { useState, useMemo } from 'react'
import { FaOdnoklassniki, FaTelegramPlane, FaVk } from 'react-icons/fa'
import {
  FiEdit2,
  FiTrash2,
  FiUserPlus,
  FiAlertTriangle,
  FiSearch,
  FiUser,
} from 'react-icons/fi'
import { ActionMenu, type ActionOption } from '../../components/ActionMenu'
import { StudentModal } from '../../components/Create-UpdateModal/StudentModal'
import { UniversalModal } from '../../components/UniversalModal'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const StudentPage = () => {
  const utils = trpc.useUtils()
  const { data, isLoading } = trpc.getStudent.useQuery()
  // Состояния
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [studentToDelete, setStudentToDelete] = useState<any>(null)
  // 1. Добавляем состояние для модалки профиля
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [selectedStudentForProfile, setSelectedStudentForProfile] =
    useState<any>(null)

  const handleOpenProfile = (student: any) => {
    setSelectedStudentForProfile(student)
    setIsProfileModalOpen(true)
  }
  const filteredStudents = useMemo(() => {
    if (!data?.Student) {
      return []
    }
    const query = searchQuery.toLowerCase()
    return data.Student.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.student_id.toLowerCase().includes(query)
    )
  }, [data, searchQuery])

  const deleteMutation = trpc.deleteStudent.useMutation({
    onSuccess: () => {
      utils.getStudent.invalidate()
      setStudentToDelete(null)
    },
    onError: (err) => alert(err.message),
  })

  const { data: deleteStats } = trpc.getStudentDeleteStats.useQuery(
    { id: studentToDelete?.id },
    { enabled: !!studentToDelete?.id }
  )

  const handleEdit = (student: any) => {
    setSelectedStudent(student)
    setIsEditModalOpen(true)
  }

  const confirmDelete = () => {
    if (studentToDelete?.id) {
      deleteMutation.mutate({ id: studentToDelete.id })
    }
  }

  if (isLoading) {
    return <div className={css.loader}>Загрузка...</div>
  }
  return (
    <div className={css.container}>
      {/* --- НОВЫЙ ХЕДЕР С ПОИСКОМ --- */}
      <div className={css.header}>
        <div className={css.titleBlock}>
          <h1>Студенты</h1>
          <span className={css.countBadge}>
            {filteredStudents.length} чел.
          </span>
        </div>

        <div className={css.controls}>
          <div className={css.searchWrapper}>
            <FiSearch className={css.searchIcon} />
            <input
              type="text"
              placeholder="Поиск по ФИО или зачетке..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={css.searchInput}
            />
          </div>

          <button
            className={css.addBtn}
            onClick={() => {
              setSelectedStudent(null)
              setIsEditModalOpen(true)
            }}
          >
            <FiUserPlus /> Добавить студента
          </button>
        </div>
      </div>

      <div className={css.tableWrapper}>
        <table className={css.table}>
          <thead>
            <tr>
              <th>Зачетка</th>
              <th>ФИО</th>
              <th>Группа</th>
              <th>Курс</th>
              <th>Боты</th>
              <th style={{ textAlign: 'right' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                // ФОРМИРУЕМ МЕНЮ ДЛЯ КАЖДОГО СТУДЕНТА
                const studentActions: ActionOption[] = [
                  {
                    label: 'Редактировать',
                    icon: <FiEdit2 />,
                    onClick: () => handleEdit(student),
                  },
                  {
                    label: 'Профиль',
                    icon: <FiUser />,
                    onClick: () => handleOpenProfile(student),
                  },
                  {
                    label: 'Удалить',
                    icon: <FiTrash2 />,
                    onClick: () => setStudentToDelete(student),
                    variant: 'danger',
                  },
                ]

                return (
                  <tr key={student.id}>
                    <td
                      className={css.studentId}
                      onClick={() => handleOpenProfile(student)}
                      style={{ cursor: 'pointer' }}
                    >
                      {student.student_id}
                    </td>
                    <td
                      className={css.studentName}
                      onClick={() => handleOpenProfile(student)}
                      style={{ cursor: 'pointer' }}
                    >
                      {student.name}
                    </td>
                    <td
                      onClick={() => handleOpenProfile(student)}
                      style={{ cursor: 'pointer' }}
                    >
                      {student.group?.name || '—'}
                    </td>
                    <td
                      onClick={() => handleOpenProfile(student)}
                      style={{ cursor: 'pointer' }}
                    >
                      {student.course} курс
                    </td>
                    <td>
                      <div className={css.botBadges}>
                        {student.botUsers.map((bu) => {
                          const platform = bu.bot.platform.toUpperCase()
                          return (
                            <span
                              key={bu.bot.id}
                              className={`${css.botBadge} ${css[platform.toLowerCase()]}`}
                              title={`${bu.bot.name} (${bu.externalId})`}
                            >
                              {platform === 'TELEGRAM' && <FaTelegramPlane />}
                              {platform === 'VK' && <FaVk />}
                              {platform === 'OK' && <FaOdnoklassniki />}
                            </span>
                          )
                        })}
                      </div>
                    </td>
                    <td className={css.actions}>
                      {/* ЗАМЕНЯЕМ СТАРЫЕ КНОПКИ НА НОВЫЙ КОМПОНЕНТ */}
                      <ActionMenu options={studentActions} />
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#718096',
                  }}
                >
                  Студенты не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Модалки остаются без изменений... */}
      <StudentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        student={selectedStudent}
      />
      <UniversalModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Информация о студенте"
        maxWidth={550}
      >
        {selectedStudentForProfile && (
          <div className={css.studentInfoModal}>
            <div className={css.modalHeaderSection}>
              <div className={css.modalAvatar}>
                {selectedStudentForProfile.name.charAt(0).toUpperCase()}
              </div>
              <h3>{selectedStudentForProfile.name}</h3>
              <p className={css.studentIdBadge}>
                № {selectedStudentForProfile.student_id}
              </p>
            </div>

            <div className={css.infoGrid}>
              <div className={css.infoItem}>
                <label>Факультет</label>
                <span>
                  {selectedStudentForProfile.group?.department?.faculty
                    ?.name || '—'}
                </span>
              </div>
              <div className={css.infoItem}>
                <label>Кафедра</label>
                <span>
                  {selectedStudentForProfile.group?.department?.name || '—'}
                </span>
              </div>
              <div className={css.infoItem}>
                <label>Группа</label>
                <span>{selectedStudentForProfile.group?.name || '—'}</span>
              </div>
              <div className={css.infoItem}>
                <label>Курс</label>
                <span>{selectedStudentForProfile.course} курс</span>
              </div>

              <div className={css.divider} />

              <div className={css.infoItemFull}>
                <label>Подключенные боты</label>
                <div className={css.platformsList}>
                  {selectedStudentForProfile.botUsers.length > 0 ? (
                    selectedStudentForProfile.botUsers.map((bu: any) => (
                      <div key={bu.bot.id} className={css.platformItem}>
                        {bu.bot.platform === 'TELEGRAM' && (
                          <FaTelegramPlane color="#0088cc" />
                        )}
                        {bu.bot.platform === 'VK' && <FaVk color="#4c75a3" />}
                        {bu.bot.platform === 'OK' && (
                          <FaOdnoklassniki color="#ee8208" />
                        )}
                        <span>{bu.bot.name}</span>
                        <small>({bu.externalId})</small>
                      </div>
                    ))
                  ) : (
                    <span className={css.noBots}>
                      Активных ботов не найдено
                    </span>
                  )}
                </div>
              </div>

              <div className={css.infoItem}>
                <label>Дата регистрации</label>
                <span>
                  {new Date(
                    selectedStudentForProfile.createdAt
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </UniversalModal>
      <UniversalModal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        title="Удаление студента"
        footer={
          <div className={css.modalFooter}>
            <button
              className={css.cancelBtn}
              onClick={() => setStudentToDelete(null)}
            >
              Отмена
            </button>
            <button
              className={css.dangerBtn}
              onClick={confirmDelete}
              // disabled={deleteMutation.isLoading}
            >
              {'Да, удалить'}
            </button>
          </div>
        }
      >
        <div className={css.deleteConfirm}>
          <FiAlertTriangle className={css.warningIcon} />
          <p>
            Вы уверены, что хотите удалить <b>{studentToDelete?.name}</b>?
          </p>
          {deleteStats && (
            <>
              <div className={css.statsHint}>
                Студент привязан к {deleteStats.botUsers} ботам.
              </div>
              <div className={css.statsHint}>
                Студент привязан к {deleteStats.receivedMessages} сообщениям.
              </div>
            </>
          )}
        </div>
      </UniversalModal>
    </div>
  )
}
