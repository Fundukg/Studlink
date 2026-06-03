import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
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
import { withPageWrapper } from '../../lib/pageWarpper'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const StudentPage = withPageWrapper({
  useQuery: () => trpc.getStudent.useQuery(),
  setProps: ({ queryResult }) => ({
    data: queryResult.data,
  }),
})(({ data: studentsData }) => {
  const utils = trpc.useUtils()

  const [searchQuery, setSearchQuery] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [studentToDelete, setStudentToDelete] = useState<any>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [selectedStudentForProfile, setSelectedStudentForProfile] =
    useState<any>(null)

  // Вспомогательная функция для склейки ФИО
  const getFullName = (s: any) =>
    `${s.lastName} ${s.firstName} ${s.middleName || ''}`.trim()

  const handleOpenProfile = (student: any) => {
    setSelectedStudentForProfile(student)
    setIsProfileModalOpen(true)
  }

  const filteredStudents = useMemo(() => {
    if (!studentsData?.students) {return []}
    const query = searchQuery.toLowerCase()
    return studentsData.students.filter(
      (s) =>
        getFullName(s).toLowerCase().includes(query) ||
        s.student_id?.toLowerCase().includes(query)
    )
  }, [studentsData, searchQuery])

  const deleteMutation = trpc.deleteStudent.useMutation({
    onSuccess: () => {
      utils.getStudent.invalidate()
      setStudentToDelete(null)
      toast.success('Студент успешно удален')
    },
    onError: (err) => {
      toast.error(err.message || 'Ошибка при удалении студента')
    },
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

  // Получить иконку платформы по названию
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'TELEGRAM':
        return <FaTelegramPlane color="#0088cc" />
      case 'VK':
        return <FaVk color="#4c75a3" />
      case 'OK':
        return <FaOdnoklassniki color="#ee8208" />
      default:
        return null
    }
  }

  return (
    <div className={css.container}>
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
                      onClick={() => handleOpenProfile(student)}
                      style={{ cursor: 'pointer' }}
                    >
                      {student.student_id || '—'}
                    </td>
                    <td
                      onClick={() => handleOpenProfile(student)}
                      style={{ cursor: 'pointer' }}
                    >
                      {getFullName(student)}
                    </td>
                    <td
                      onClick={() => handleOpenProfile(student)}
                      style={{ cursor: 'pointer' }}
                    >
                      {student.group || '—'}
                    </td>
                    <td
                      onClick={() => handleOpenProfile(student)}
                      style={{ cursor: 'pointer' }}
                    >
                      {student.course || '—'} курс
                    </td>
                    <td>
                      <div className={css.botBadges}>
                        {student.bots.map((platform: string) => (
                          <span
                            key={platform}
                            className={`${css.botBadge} ${css[platform.toLowerCase()]}`}
                          >
                            {getPlatformIcon(platform)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className={css.actions}>
                      <ActionMenu options={studentActions} />
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: 'center', padding: '40px' }}
                >
                  Студенты не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <StudentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        student={selectedStudent}
      />

      {/* Модалка профиля студента */}
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
                {selectedStudentForProfile.firstName?.charAt(0) || '?'}
              </div>
              <h3>{getFullName(selectedStudentForProfile)}</h3>
              <p className={css.studentIdBadge}>
                № {selectedStudentForProfile.student_id || '—'}
              </p>
            </div>
            <div className={css.infoGrid}>
              <div className={css.infoItem}>
                <label>Факультет</label>
                <span>{selectedStudentForProfile.faculty || '—'}</span>
              </div>
              <div className={css.infoItem}>
                <label>Кафедра</label>
                <span>{selectedStudentForProfile.department || '—'}</span>
              </div>
              <div className={css.infoItem}>
                <label>Группа</label>
                <span>{selectedStudentForProfile.group || '—'}</span>
              </div>
              <div className={css.infoItem}>
                <label>Курс</label>
                <span>{selectedStudentForProfile.course || '—'} курс</span>
              </div>
              <div className={css.infoItemFull}>
                <label>Подключенные боты</label>
                <div className={css.platformsList}>
                  {selectedStudentForProfile.bots?.length > 0 ? (
                    selectedStudentForProfile.bots.map((platform: string) => (
                      <div key={platform} className={css.platformItem}>
                        {getPlatformIcon(platform)}
                        <span>{platform}</span>
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

      {/* Модалка удаления */}
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
            <button className={css.dangerBtn} onClick={confirmDelete}>
              Да, удалить
            </button>
          </div>
        }
      >
        <div className={css.deleteConfirm}>
          <FiAlertTriangle className={css.warningIcon} />
          <p>
            Вы уверены, что хотите удалить{' '}
            <b>{studentToDelete && getFullName(studentToDelete)}</b>?
          </p>
          {deleteStats && (
            <>
              <div className={css.statsHint}>
                Студент привязан к {deleteStats.botUsers} ботам.
              </div>
              <div className={css.statsHint}>
                Студент привязан к {deleteStats.sentMessages} отправленным
                сообщениям.
              </div>
              <div className={css.statsHint}>
                Студент привязан к {deleteStats.receivedMessages} полученным
                сообщениям.
              </div>
            </>
          )}
        </div>
      </UniversalModal>
    </div>
  )
})
