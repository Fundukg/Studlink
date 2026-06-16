import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiUser,
  FiMail,
  FiAlertTriangle,
  FiInfo,
  FiShield,
  FiBookOpen, // Иконка для факультета
} from 'react-icons/fi'
import { ActionMenu } from '../../components/ActionMenu'
import { DeaneryModal } from '../../components/Create-UpdateModal/DeaneryModal'
import { UniversalModal } from '../../components/UniversalModal'
import { UniversalTable, type Column } from '../../components/UniversalTable'
import { withPageWrapper } from '../../lib/pageWarpper'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const DeaneryPage = withPageWrapper({
  useQuery: () => trpc.getDeaneryList.useQuery(),
  setProps: ({ queryResult }) => ({
    data: queryResult.data,
  }),
})(({ data: deaneryData }) => {
  const utils = trpc.useUtils()
  // Запрашиваем данные именно для списка деканата

  const [searchQuery, setSearchQuery] = useState('')

  // Состояния модалок
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [staffToDelete, setStaffToDelete] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [viewingStaff, setViewingStaff] = useState<any>(null)

  // Фильтрация по Нику, ФИО или Названию факультета
  const filteredStaff = useMemo(() => {
    if (!deaneryData?.staff) {
      return []
    }
    const query = searchQuery.toLowerCase()
    return deaneryData.staff.filter(
      (s) =>
        s.nick?.toLowerCase().includes(query) ||
        `${s.lastName} ${s.firstName} ${s.middleName}`
          .toLowerCase()
          .includes(query) ||
        s.facultyName.toLowerCase().includes(query)
    )
  }, [deaneryData, searchQuery])

  // Мутация удаления (использует общий или специализированный роут)
  const deleteMutation = trpc.deleteStaff.useMutation({
    onSuccess: () => {
      toast.success('Сотрудник деканата успешно удалён')
      utils.getDeaneryList.invalidate()
      setStaffToDelete(null)
    },
    onError: (err) => {
      toast.error(`Ошибка удаления: ${err.message}`)
    },
  })

  // Статистика перед удалением
  const { data: deleteStats } = trpc.getDeaneryDeleteStats.useQuery(
    { id: staffToDelete?.id },
    { enabled: !!staffToDelete }
  )

  const handleShowDetails = (staff: any) => {
    setViewingStaff(staff)
    setIsDetailsOpen(true)
  }

  const columns: Column<any>[] = [
    {
      header: 'Сотрудник',
      width: '25%',
      render: (staff) => (
        <div
          className={css.staffInfo}
          onClick={() => handleShowDetails(staff)}
          style={{ cursor: 'pointer' }}
        >
          <div className={css.avatarSmall}>
            <FiUser />
          </div>
          <div className={css.nameBlock}>
            <div className={css.nickName}>{staff.nick}</div>
            <div className={css.fullName}>
              {staff.lastName} {staff.firstName} {staff.middleName}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Закрепленный факультет',
      render: (s) => (
        <span className={css.facultyBadge}>
          <FiBookOpen size={12} /> {s.facultyName || 'Не привязан'}
        </span>
      ),
    },
    {
      header: 'Активность',
      render: (s) => (
        <div className={css.activityBadges}>
          <span className={css.badgeSent} title="Отправлено сообщений">
            <FiMail size={12} /> {s.stats?.sentMessages || 0}
          </span>
        </div>
      ),
    },
    {
      header: 'Действия',
      align: 'right',
      render: (staff) => (
        <ActionMenu
          options={[
            {
              label: 'Детали',
              icon: <FiInfo />,
              onClick: () => handleShowDetails(staff),
            },
            {
              label: 'Редактировать',
              icon: <FiEdit2 />,
              onClick: () => {
                setSelectedStaff(staff)
                setIsModalOpen(true)
              },
            },
            {
              label: 'Удалить',
              icon: <FiTrash2 />,
              onClick: () => setStaffToDelete(staff),
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
          <h1>Сотрудники деканата</h1>
          <span className={css.countBadge}>{filteredStaff.length}</span>
        </div>

        <div className={css.controls}>
          <div className={css.searchWrapper}>
            <FiSearch className={css.searchIcon} />
            <input
              type="text"
              placeholder="Поиск по имени, нику или факультету..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={css.searchInput}
            />
          </div>
          <button
            className={css.addBtn}
            onClick={() => {
              setSelectedStaff(null) // Передаем null, чтобы DeaneryModal понял, что это создание
              setIsModalOpen(true)
            }}
          >
            <FiPlus /> Добавить сотрудника
          </button>
        </div>
      </div>

      <div className={css.tableWrapper}>
        <UniversalTable
          data={filteredStaff}
          columns={columns}
          emptyMessage="Сотрудники деканата не найдены"
        />
      </div>

      {/* Модалка ДЕТАЛЕЙ */}
      <UniversalModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Карточка сотрудника деканата"
      >
        {viewingStaff && (
          <div className={css.detailsContent}>
            <div className={css.detailsHeader}>
              <div className={css.bigAvatar}>
                <FiUser />
              </div>
              <h2>
                {viewingStaff.lastName} {viewingStaff.firstName}{' '}
                {viewingStaff.middleName}
              </h2>
              <span className={`${css.roleBadge} ${css.deanery}`}>
                Деканат
              </span>
            </div>

            <div className={css.detailsGrid}>
              <div className={css.detailItem}>
                <label>Логин (Ник)</label>
                <span>{viewingStaff.nick}</span>
              </div>
              <div className={css.detailItem}>
                <label>Привязанный факультет</label>
                <span className={css.facultyHighlight}>
                  {viewingStaff.deaneryProfile?.faculty?.name || 'Отсутствует'}
                </span>
              </div>
              <div className={css.detailItem}>
                <label>Дата регистрации</label>
                <span>
                  {new Date(viewingStaff.createdAt).toLocaleDateString(
                    'ru-RU'
                  )}
                </span>
              </div>
              <div className={css.detailItem}>
                <label>Отправлено рассылок/сообщений</label>
                <span>{viewingStaff._count?.sentMessages || 0} шт.</span>
              </div>
            </div>

            <div className={css.passwordBox}>
              <label>
                <FiShield /> Текущий пароль (хэш/исходный)
              </label>
              <code>{viewingStaff.password}</code>
            </div>
          </div>
        )}
      </UniversalModal>

      {/* Модалка удаления */}
      <UniversalModal
        isOpen={!!staffToDelete}
        onClose={() => setStaffToDelete(null)}
        title="Удаление сотрудника деканата"
        footer={
          <div className={css.modalFooter}>
            <button
              className={css.cancelBtn}
              onClick={() => setStaffToDelete(null)}
            >
              Отмена
            </button>
            <button
              className={css.dangerBtn}
              onClick={() => deleteMutation.mutate({ id: staffToDelete.id })}
              disabled={deleteMutation.isPending}
            >
              Удалить
            </button>
          </div>
        }
      >
        <div className={css.deleteConfirm}>
          <FiAlertTriangle className={css.warningIcon} />
          <p>
            Удалить аккаунт сотрудника деканата <b>{staffToDelete?.nick}</b>?
          </p>
          <div className={css.statsHint}>
            Будет безвозвратно удалено:
            <ul>
              <li>Связанный профиль деканата и доступы к факультету</li>
              <li>
                Все отправленные им сообщения ({deleteStats?.sentMessages || 0}{' '}
                шт.)
              </li>
            </ul>
          </div>
        </div>
      </UniversalModal>

      {/* Модалка добавления/редактирования */}
      <DeaneryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        staff={selectedStaff}
      />
    </div>
  )
})
