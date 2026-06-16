// src/pages/AdminPage/index.tsx
import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import {
  FiPlus,
  FiSearch,
  FiUser,
  FiEdit2,
  FiTrash2,
  FiInfo,
  FiAlertTriangle,
  FiShield,
} from 'react-icons/fi'
import { ActionMenu } from '../../components/ActionMenu'
import { AdminModal } from '../../components/Create-UpdateModal/AdminModal'
import { CustomToaster } from '../../components/CustomToaster'
import { UniversalModal } from '../../components/UniversalModal'
import { UniversalTable, type Column } from '../../components/UniversalTable'
import { withPageWrapper } from '../../lib/pageWarpper'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const AdminPage = withPageWrapper({
  useQuery: () => trpc.getAdminList.useQuery(),
  setProps: ({ queryResult }) => ({
    data: queryResult.data,
  }),
})(({ data: adminData }) => {
  const utils = trpc.useUtils()
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null)
  const [adminToDelete, setAdminToDelete] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [viewingAdmin, setviewingAdmin] = useState<any>(null)
  const { data: deleteStats } = trpc.getDeaneryDeleteStats.useQuery(
    { id: adminToDelete?.id },
    { enabled: !!adminToDelete }
  )
  const filteredAdmins = useMemo(() => {
    if (!adminData?.formattedList) {
      return []
    }
    const query = searchQuery.toLowerCase()
    return adminData.formattedList.filter(
      (admin) =>
        admin.nick?.toLowerCase().includes(query) ||
        `${admin.lastName} ${admin.firstName}`.toLowerCase().includes(query)
    )
  }, [adminData, searchQuery])

  const deleteMutation = trpc.deleteStaff.useMutation({
    onSuccess: () => {
      toast.success('Администратор удалён')
      utils.getAdminList.invalidate()
      setAdminToDelete(null)
    },
    onError: (err) => toast.error(`Ошибка удаления: ${err.message}`),
  })
  const handleShowDetails = (staff: any) => {
    setviewingAdmin(staff)
    setIsDetailsOpen(true)
  }

  const columns: Column<any>[] = [
    {
      header: 'Администратор',
      width: '25%',
      render: (admin) => (
        <div
          className={css.staffInfo}
          onClick={() => handleShowDetails(admin)}
          style={{ cursor: 'pointer' }}
        >
          <div className={css.avatarSmall}>
            <FiUser />
          </div>
          <div className={css.nameBlock}>
            <div className={css.nickName}>{admin.nick}</div>
            <div className={css.fullName}>
              {admin.lastName} {admin.firstName} {admin.middleName}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Дата регистрации',
      render: (admin) => new Date(admin.createdAt).toLocaleDateString('ru-RU'),
    },
    {
      header: 'Действия',
      align: 'right',
      render: (admin) => (
        <ActionMenu
          options={[
            {
              label: 'Детали',
              icon: <FiInfo />,
              onClick: () => handleShowDetails(admin),
            },
            {
              label: 'Редактировать',
              icon: <FiEdit2 />,
              onClick: () => {
                setSelectedAdmin(admin)
                setIsModalOpen(true)
              },
            },
            {
              label: 'Удалить',
              icon: <FiTrash2 />,
              onClick: () => setAdminToDelete(admin),
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
          <h1>Администраторы</h1>
          <span className={css.countBadge}>{filteredAdmins.length}</span>
        </div>
        <div className={css.controls}>
          <div className={css.searchWrapper}>
            <FiSearch className={css.searchIcon} />
            <input
              type="text"
              placeholder="Поиск по имени или нику..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={css.searchInput}
            />
          </div>
          <button
            className={css.addBtn}
            onClick={() => {
              setSelectedAdmin(null)
              setIsModalOpen(true)
            }}
          >
            <FiPlus /> Добавить администратора
          </button>
        </div>
      </div>

      <div className={css.tableWrapper}>
        <UniversalTable
          data={filteredAdmins}
          columns={columns}
          emptyMessage="Администраторы не найдены"
        />
      </div>

      {/* Модалка создания/редактирования */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        staff={selectedAdmin}
      />
      {/* Модалка ДЕТАЛЕЙ */}
      <UniversalModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Карточка преподавателя"
      >
        {viewingAdmin && (
          <div className={css.detailsContent}>
            <div className={css.detailsHeader}>
              <div className={css.bigAvatar}>
                <FiUser />
              </div>
              <h2>
                {viewingAdmin.lastName} {viewingAdmin.firstName}{' '}
                {viewingAdmin.middleName}
              </h2>
              <span className={`${css.roleBadge} ${css.deanery}`}>
                Преподаватель
              </span>
            </div>

            <div className={css.detailsGrid}>
              <div className={css.detailItem}>
                <label>Логин (Ник)</label>
                <span>{viewingAdmin.nick}</span>
              </div>
              <div className={css.detailItem}>
                <label>Дата регистрации</label>
                <span>
                  {new Date(viewingAdmin.createdAt).toLocaleDateString(
                    'ru-RU'
                  )}
                </span>
              </div>
              <div className={css.detailItem}>
                <label>Отправлено рассылок/сообщений</label>
                <span>{viewingAdmin._count?.sentMessages || 0} шт.</span>
              </div>
            </div>

            <div className={css.passwordBox}>
              <label>
                <FiShield /> Текущий пароль (хэш/исходный)
              </label>
              <code>{viewingAdmin.password}</code>
            </div>
          </div>
        )}
      </UniversalModal>
      {/* Модалка удаления */}
      <UniversalModal
        isOpen={!!adminToDelete}
        onClose={() => setAdminToDelete(null)}
        title="Удаление администратора"
        footer={
          <div className={css.modalFooter}>
            <button
              className={css.cancelBtn}
              onClick={() => setAdminToDelete(null)}
            >
              Отмена
            </button>
            <button
              className={css.dangerBtn}
              onClick={() => deleteMutation.mutate({ id: adminToDelete.id })}
            >
              Удалить
            </button>
          </div>
        }
      >
        <div className={css.deleteConfirm}>
          <FiAlertTriangle className={css.warningIcon} />
          <p>
            Удалить аккаунт администратора <b>{adminToDelete?.nick}</b>?
          </p>
          <div className={css.statsHint}>
            Будет безвозвратно удалено:
            <ul>
              <li>Связанный профиль администратора и доступы к системе</li>
              <li>
                Все отправленные им сообщения ({deleteStats?.sentMessages || 0}{' '}
                шт.)
              </li>
            </ul>
          </div>
        </div>
      </UniversalModal>

      <CustomToaster />
    </div>
  )
})
