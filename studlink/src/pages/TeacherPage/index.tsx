import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { FaTelegramPlane, FaVk, FaOdnoklassniki } from 'react-icons/fa' // Импортируем иконки для ботов
import {
  FiPlus,
  FiSearch,
  FiUser,
  FiEdit2,
  FiTrash2,
  FiInfo,
  FiShield,
  FiAlertTriangle,
} from 'react-icons/fi'
import { ActionMenu } from '../../components/ActionMenu'
import { TeacherModal } from '../../components/Create-UpdateModal/TeacherModal'
import { CustomToaster } from '../../components/CustomToaster'
import { UniversalModal } from '../../components/UniversalModal'
import { UniversalTable, type Column } from '../../components/UniversalTable'
import { withPageWrapper } from '../../lib/pageWarpper'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const TeacherPage = withPageWrapper({
  useQuery: () => trpc.getTeacherList.useQuery(),
  setProps: ({ queryResult }) => ({
    data: queryResult.data,
  }),
})(({ data: teachersData }) => {
  const utils = trpc.useUtils()
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null)
  const [teacherToDelete, setTeacherToDelete] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [viewingTeacher, setViewingTeacher] = useState<any>(null)

  const { data: deleteStats } = trpc.getDeaneryDeleteStats.useQuery(
    { id: teacherToDelete?.id },
    { enabled: !!teacherToDelete }
  )

  // Вспомогательная функция для получения иконок платформ (как у студентов)
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

  const filteredTeachers = useMemo(() => {
    if (!teachersData?.staff) {
      return []
    }
    const query = searchQuery.toLowerCase()
    return teachersData.staff.filter(
      (teacher) =>
        teacher.nick?.toLowerCase().includes(query) ||
        `${teacher.lastName} ${teacher.firstName}`
          .toLowerCase()
          .includes(query) ||
        teacher.groups?.some((g: string) => g.toLowerCase().includes(query))
    )
  }, [teachersData, searchQuery])

  const deleteMutation = trpc.deleteStaff.useMutation({
    onSuccess: () => {
      toast.success('Преподаватель удалён')
      utils.getTeacherList.invalidate()
      setTeacherToDelete(null)
    },
    onError: (err) => toast.error(`Ошибка удаления: ${err.message}`),
  })

  const handleShowDetails = (staff: any) => {
    setViewingTeacher(staff)
    setIsDetailsOpen(true)
  }

  const columns: Column<any>[] = [
    {
      header: 'Преподаватель',
      render: (teacher) => (
        <div
          className={css.staffInfo}
          onClick={() => handleShowDetails(teacher)}
          style={{ cursor: 'pointer' }}
        >
          <div className={css.avatarSmall}>
            <FiUser />
          </div>
          <div className={css.nameBlock}>
            <div className={css.nickName}>{teacher.nick}</div>
            <div className={css.fullName}>
              {teacher.lastName} {teacher.firstName} {teacher.middleName}
            </div>
          </div>
        </div>
      ),
      width: '25%',
    },
    {
      header: 'Закреплённые группы',
      render: (t) => t.groups?.join(', ') || '—',
    },
    {
      header: 'Боты',
      render: (t) => (
        <div className={css.botBadges}>
          {t.bots?.map((p: string) => (
            <span
              key={p}
              className={`${css.botBadge} ${css[p.toLowerCase()]}`}
            >
              {getPlatformIcon(p)}
            </span>
          )) || '—'}
        </div>
      ),
    },
    {
      header: 'Сообщения',
      render: (t) => (
        <div className={css.stats}>
          <span>Отп: {t.stats?.sentMessages ?? 0}</span>
          <span style={{ marginLeft: '8px' }}>
            Пол: {t.stats?.receivedMessages ?? 0}
          </span>
        </div>
      ),
    },
    {
      header: 'Действия',
      align: 'right',
      render: (teacher) => (
        <ActionMenu
          options={[
            {
              label: 'Детали',
              icon: <FiInfo />,
              onClick: () => handleShowDetails(teacher),
            },
            {
              label: 'Редактировать',
              icon: <FiEdit2 />,
              onClick: () => {
                setSelectedTeacher(teacher)
                setIsModalOpen(true)
              },
            },
            {
              label: 'Удалить',
              icon: <FiTrash2 />,
              onClick: () => setTeacherToDelete(teacher),
              variant: 'danger',
            },
          ]}
        />
      ),
    },
  ]

  return (
    <div className={css.container}>
      <div className={css.header}>
        <div className={css.titleBlock}>
          <h1>Преподаватели</h1>
          <span className={css.countBadge}>{filteredTeachers.length}</span>
        </div>
        <div className={css.controls}>
          <div className={css.searchWrapper}>
            <FiSearch className={css.searchIcon} />
            <input
              type="text"
              placeholder="Поиск по имени, нику или группе..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={css.searchInput}
            />
          </div>
          <button
            className={css.addBtn}
            onClick={() => {
              setSelectedTeacher(null)
              setIsModalOpen(true)
            }}
          >
            <FiPlus /> Добавить преподавателя
          </button>
        </div>
      </div>

      <div className={css.tableWrapper}>
        <div className={css.tableWrapper}>
          <UniversalTable
            data={filteredTeachers}
            columns={columns}
            emptyMessage="Преподаватели не найдены"
          />
        </div>

        <TeacherModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          staff={selectedTeacher}
        />

        {/* Модалка ДЕТАЛЕЙ */}
        <UniversalModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          title="Карточка преподавателя"
        >
          {viewingTeacher && (
            <div className={css.detailsContent}>
              <div className={css.detailsHeader}>
                <div className={css.bigAvatar}>
                  <FiUser />
                </div>
                <h2>
                  {viewingTeacher.lastName} {viewingTeacher.firstName}{' '}
                  {viewingTeacher.middleName}
                </h2>
                <span className={`${css.roleBadge} ${css.deanery}`}>
                  Преподаватель
                </span>
              </div>

              <div className={css.detailsGrid}>
                <div className={css.detailItem}>
                  <label>Логин (Ник)</label>
                  <span>{viewingTeacher.nick}</span>
                </div>
                <div className={css.detailItem}>
                  <label>Привязанныe группы</label>
                  <span className={css.facultyHighlight}>
                    {viewingTeacher.groups?.join(', ') || 'Отсутствует'}
                  </span>
                </div>
                <div className={css.detailItem}>
                  <label>Дата регистрации</label>
                  <span>
                    {new Date(viewingTeacher.createdAt).toLocaleDateString(
                      'ru-RU'
                    )}
                  </span>
                </div>
                <div className={css.detailItem}>
                  <label>Подключенные боты</label>
                  <div
                    className={css.platformsList}
                    style={{ display: 'flex', gap: '6px', marginTop: '4px' }}
                  >
                    {viewingTeacher.bots?.map((b: string) => (
                      <span
                        key={b}
                        className={`${css.botBadge} ${css[b.toLowerCase()]}`}
                      >
                        {getPlatformIcon(b)}
                      </span>
                    )) || '—'}
                  </div>
                </div>
                <div className={css.detailItem}>
                  <label>Статистика сообщений</label>
                  <span>
                    Отправлено: {viewingTeacher.stats?.sentMessages ?? 0} шт.{' '}
                    <br />
                    Получено: {viewingTeacher.stats?.receivedMessages ?? 0} шт.
                  </span>
                </div>
              </div>

              <div className={css.passwordBox}>
                <label>
                  <FiShield /> Текущий пароль (хэш/исходный)
                </label>
                <code>{viewingTeacher.password}</code>
              </div>
            </div>
          )}
        </UniversalModal>

        {/* Модалка Удаления */}
        <UniversalModal
          isOpen={!!teacherToDelete}
          onClose={() => setTeacherToDelete(null)}
          title="Удаление преподавателя"
          footer={
            <div className={css.modalFooter}>
              <button
                className={css.cancelBtn}
                onClick={() => setTeacherToDelete(null)}
              >
                Отмена
              </button>
              <button
                className={css.dangerBtn}
                onClick={() =>
                  deleteMutation.mutate({ id: teacherToDelete.id })
                }
              >
                Удалить
              </button>
            </div>
          }
        >
          <div className={css.deleteConfirm}>
            <FiAlertTriangle className={css.warningIcon} />
            <p>
              Удалить аккаунт преподавателя <b>{teacherToDelete?.nick}</b>?
            </p>
            <div className={css.statsHint}>
              Будет безвозвратно удалено:
              <ul>
                <li>Связанный профиль преподавателя и доступы к системе</li>
                <li>
                  Все отправленные им сообщения (
                  {deleteStats?.sentMessages || 0} шт.)
                </li>
                <li>
                  Все полученные им сообщения (
                  {deleteStats?.receivedMessages || 0} шт.)
                </li>
                <li>
                  Все присвоенные им группы (
                  {deleteStats?.teacherAssignments || 0} шт.)
                </li>
              </ul>
            </div>
          </div>
        </UniversalModal>

        <CustomToaster />
      </div>
    </div>
  )
})
