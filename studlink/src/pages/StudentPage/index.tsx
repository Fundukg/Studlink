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
import { ActionMenu } from '../../components/ActionMenu'
import { StudentModal } from '../../components/Create-UpdateModal/StudentModal'
import { UniversalModal } from '../../components/UniversalModal'
import { UniversalTable, type Column } from '../../components/UniversalTable' // Импортируем таблицу
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
  const [currentPage, setCurrentPage] = useState(1)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [studentToDelete, setStudentToDelete] = useState<any>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [selectedStudentForProfile, setSelectedStudentForProfile] =
    useState<any>(null)

  const ITEMS_PER_PAGE = 10

  const getFullName = (s: any) =>
    `${s.lastName} ${s.firstName} ${s.middleName || ''}`.trim()

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

  const filteredStudents = useMemo(() => {
    if (!studentsData?.students) {
      return []
    }
    const query = searchQuery.toLowerCase()
    return studentsData.students.filter(
      (s) =>
        getFullName(s).toLowerCase().includes(query) ||
        s.student_id?.toLowerCase().includes(query)
    )
  }, [studentsData, searchQuery])

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE)
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredStudents, currentPage])

  useMemo(() => setCurrentPage(1), [searchQuery])

  const deleteMutation = trpc.deleteStudent.useMutation({
    onSuccess: () => {
      utils.getStudent.invalidate()
      setStudentToDelete(null)
      toast.success('Студент успешно удален')
    },
    onError: (err) => toast.error(err.message || 'Ошибка'),
  })

  const confirmDelete = () => {
    if (studentToDelete?.id) {
      deleteMutation.mutate({ id: studentToDelete.id })
    }
  }

  const { data: deleteStats } = trpc.getStudentDeleteStats.useQuery(
    { id: studentToDelete?.id },
    { enabled: !!studentToDelete?.id }
  )

  // 1. ОПРЕДЕЛЯЕМ КОЛОНКИ
  const columns: Column<any>[] = useMemo(
    () => [
      {
        header: 'Студент',
        width: '25%',
        render: (student) => (
          <div
            className={css.nameWithIcon}
            onClick={() => {
              setSelectedStudentForProfile(student)
              setIsProfileModalOpen(true)
            }}
            style={{ cursor: 'pointer' }}
          >
            <FiUser className={css.entryIcon} />
            <div className={css.deptInfo}>
              <div className={css.primaryText}>{getFullName(student)}</div>
              <div className={css.secondaryText}>
                ID: {student.student_id || '—'}
              </div>
            </div>
          </div>
        ),
      },
      {
        header: 'Группа',
        accessorKey: 'group', // Простой вывод свойства
      },
      {
        header: 'Курс',
        render: (student) => `${student.course || '—'} курс`, // Кастомный вывод текста
      },
      {
        header: 'Боты',
        render: (student) => (
          <div className={css.botBadges}>
            {student.bots.map((p: string) => (
              <span
                key={p}
                className={`${css.botBadge} ${css[p.toLowerCase()]}`}
              >
                {getPlatformIcon(p)}
              </span>
            ))}
          </div>
        ),
      },
      {
        header: 'Действия',
        align: 'right',
        render: (student) => (
          <ActionMenu
            options={[
              {
                label: 'Профиль',
                icon: <FiUser />,
                onClick: () => {
                  setSelectedStudentForProfile(student)
                  setIsProfileModalOpen(true)
                },
              },
              {
                label: 'Редактировать',
                icon: <FiEdit2 />,
                onClick: () => {
                  setSelectedStudent(student)
                  setIsEditModalOpen(true)
                },
              },
              {
                label: 'Удалить',
                icon: <FiTrash2 />,
                onClick: () => setStudentToDelete(student),
                variant: 'danger',
              },
            ]}
          />
        ),
      },
    ],
    [] // Пустой массив зависимостей, так как функции работают с локальным скоупом `render`
  )

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
              placeholder="Поиск по ФИО или номеру..."
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
            <FiUserPlus /> Добавить
          </button>
        </div>
      </div>

      {/* 2. ИСПОЛЬЗУЕМ УНИВЕРСАЛЬНУЮ ТАБЛИЦУ */}
      <UniversalTable
        data={paginatedStudents}
        columns={columns}
        emptyMessage="Студенты не найдены"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

  

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
            <div className={css.statsHint}>
              Будут безвозвратно удалены:
              <ul>
                <li>Связи с ботами: {deleteStats.botUsers}</li>
                <li>Отправленные сообщения: {deleteStats.sentMessages}</li>
                <li>Полученные сообщения: {deleteStats.receivedMessages}</li>
              </ul>
            </div>
          )}
        </div>
      </UniversalModal>
    </div>
  )
})
