import { useState, useMemo } from 'react'
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiUser,
  FiMail,
  FiAlertTriangle,
  // FiClock,
  // FiEye,
  // FiEyeOff,
  FiInfo,
  FiShield,
} from 'react-icons/fi'
import { ActionMenu, type ActionOption } from '../../components/ActionMenu'
import { StaffModal } from '../../components/Create-UpdateModal/StaffModal'
import { UniversalModal } from '../../components/UniversalModal'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const StaffPage = () => {
  const utils = trpc.useUtils()
  const { data, isLoading } = trpc.getStaff.useQuery()
  // console.log(data)
  const [searchQuery, setSearchQuery] = useState('')
  // const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
  //   {}
  // )

  // Состояния модалок
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [staffToDelete, setStaffToDelete] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [viewingStaff, setViewingStaff] = useState<any>(null)

  // Фильтрация по Нику или ФИО
  const filteredStaff = useMemo(() => {
    if (!data?.Staff) {
      return []
    }
    const query = searchQuery.toLowerCase()
    return data.Staff.filter(
      (s) =>
        s.nick.toLowerCase().includes(query) ||
        `${s.lastName} ${s.firstName}`.toLowerCase().includes(query)
    )
  }, [data, searchQuery])

  const deleteMutation = trpc.deleteStaff.useMutation({
    onSuccess: () => {
      utils.getStaff.invalidate()
      setStaffToDelete(null)
    },
    onError: (err) => alert(err.message),
  })

  const { data: deleteStats } = trpc.getStaffDeleteStats.useQuery(
    { id: staffToDelete?.id },
    { enabled: !!staffToDelete }
  )

  // const togglePassword = (id: string) => {
  //   setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }))
  // }

  const handleShowDetails = (staff: any) => {
    setViewingStaff(staff)
    setIsDetailsOpen(true)
  }

  if (isLoading) {
    return <div className={css.loader}>Загрузка персонала...</div>
  }

  return (
    <div className={css.container}>
      <div className={css.header}>
        <div className={css.titleBlock}>
          <h1>Сотрудники</h1>
          <span className={css.countBadge}>{filteredStaff.length}</span>
        </div>

        <div className={css.controls}>
          <div className={css.searchWrapper}>
            <FiSearch className={css.searchIcon} />
            <input
              type="text"
              placeholder="Поиск по нику или имени..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={css.searchInput}
            />
          </div>
          <button
            className={css.addBtn}
            onClick={() => {
              setSelectedStaff(null)
              setIsModalOpen(true)
            }}
          >
            <FiPlus /> Добавить сотрудника
          </button>
        </div>
      </div>

      <div className={css.tableWrapper}>
        <table className={css.table}>
          <thead>
            <tr>
              <th>Сотрудник</th>
              <th>Роль</th>
              {/* <th>Пароль</th> */}
              <th>Активность</th>
              <th style={{ textAlign: 'right' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.length > 0 ? (
              filteredStaff.map((staff) => {
                const actions: ActionOption[] = [
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
                ]

                return (
                  <tr key={staff.id}>
                    <td
                      className={css.staffCell}
                      onClick={() => handleShowDetails(staff)}
                    >
                      <div className={css.staffInfo}>
                        <div className={css.avatarSmall}>
                          <FiUser />
                        </div>
                        <div className={css.nameBlock}>
                          <div className={css.nickName}>{staff.nick}</div>
                          <div className={css.fullName}>
                            {staff.lastName} {staff.firstName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${css.roleBadge} ${css[staff.role]}`}>
                        {staff.role}
                      </span>
                    </td>
                    {/* <td>
                    <div className={css.passwordCell}>
                      <span className={css.passwordText}>
                        {showPasswords[staff.id] ? staff.password : '••••••••'}
                      </span>
                      <button
                        onClick={() => togglePassword(staff.id)}
                        className={css.eyeBtn}
                      >
                        {showPasswords[staff.id] ? (
                          <FiEyeOff size={14} />
                        ) : (
                          <FiEye size={14} />
                        )}
                      </button>
                    </div>
                  </td> */}
                    <td>
                      <div className={css.activityBadges}>
                        <span
                          className={css.badgeSent}
                          title="Отправлено сообщений"
                        >
                          <FiMail size={12} /> {staff._count.sentMessages}
                        </span>
                      </div>
                    </td>
                    <td className={css.actions}>
                      <ActionMenu options={actions} />
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
                  Сотрудники не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Модалка ДЕТАЛЕЙ */}
      <UniversalModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Карточка сотрудника"
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
              <span
                className={`${css.roleBadge} ${css[viewingStaff.role.toLowerCase()]}`}
              >
                {viewingStaff.role}
              </span>
            </div>

            <div className={css.detailsGrid}>
              <div className={css.detailItem}>
                <label>Логин (Ник)</label>
                <span>{viewingStaff.nick}</span>
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
                <label>Отправлено сообщений</label>
                <span>{viewingStaff._count.sentMessages} шт.</span>
              </div>
              <div className={css.detailItem}>
                <label>Получено сообщений</label>
                <span>{viewingStaff._count.receivedMessages} шт.</span>
              </div>
            </div>

            <div className={css.passwordBox}>
              <label>
                <FiShield /> Текущий пароль
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
        title="Удаление сотрудника"
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
            Удалить аккаунт <b>{staffToDelete?.nick}</b>?
          </p>
          <div className={css.statsHint}>
            Будет безвозвратно удалено:
            <ul>
              <li>Все сообщения ({deleteStats?.sentMessages || 0} шт.)</li>
              <li>Личные данные и доступ к системе</li>
            </ul>
          </div>
        </div>
      </UniversalModal>

      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        staff={selectedStaff}
      />
    </div>
  )
}
