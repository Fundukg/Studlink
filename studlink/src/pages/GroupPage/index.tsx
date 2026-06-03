import { useState, useMemo } from 'react'
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiUsers,
  FiInfo,
  FiBookOpen,
  FiAlertTriangle,
} from 'react-icons/fi'
import { ActionMenu, type ActionOption } from '../../components/ActionMenu'
import { GroupModal } from '../../components/Create-UpdateModal/GroupModal'
import { UniversalModal } from '../../components/UniversalModal'
import { withPageWrapper } from '../../lib/pageWarpper'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const GroupPage = withPageWrapper({
  useQuery: () => trpc.getGroup.useQuery(),
  setProps: ({ queryResult }) => ({
    data: queryResult.data,
  }),
})(({ data: groupsData }) => {
  const utils = trpc.useUtils()

  // Данные
  const [searchQuery, setSearchQuery] = useState('')

  // Состояния модалок
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)

  const [groupToDelete, setGroupToDelete] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [viewingGroup, setViewingGroup] = useState<any>(null)

  // Фильтрация (по названию группы, кафедры или факультета)
  const filteredGroups = useMemo(() => {
    if (!groupsData?.Group) {return []}
    const query = searchQuery.toLowerCase()
    return groupsData.Group.filter(
      (g) =>
        g.name.toLowerCase().includes(query) ||
        g.department.name.toLowerCase().includes(query) ||
        g.department.faculty.name.toLowerCase().includes(query)
    )
  }, [groupsData, searchQuery])

  // Удаление
  const deleteMutation = trpc.deleteGroup.useMutation({
    onSuccess: () => {
      utils.getGroup.invalidate()
      setGroupToDelete(null)
    },
    onError: (err) => alert(err.message),
  })

  // Статистика перед удалением
  const { data: deleteStats } = trpc.getGroupDeleteStats.useQuery(
    { id: groupToDelete?.id },
    { enabled: !!groupToDelete }
  )

  const handleEdit = (group: any) => {
    setSelectedGroup(group)
    setIsEditModalOpen(true)
  }

  const handleShowDetails = (group: any) => {
    setViewingGroup(group)
    setIsDetailsOpen(true)
  }

  return (
    <div className={css.container}>
      <div className={css.header}>
        <div className={css.titleBlock}>
          <h1>Группы</h1>
          <span className={css.countBadge}>{filteredGroups.length}</span>
        </div>

        <div className={css.controls}>
          <div className={css.searchWrapper}>
            <FiSearch className={css.searchIcon} />
            <input
              type="text"
              placeholder="Поиск группы, кафедры..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={css.searchInput}
            />
          </div>
          <button
            className={css.addBtn}
            onClick={() => {
              setSelectedGroup(null)
              setIsEditModalOpen(true)
            }}
          >
            <FiPlus /> Добавить группу
          </button>
        </div>
      </div>

      <div className={css.tableWrapper}>
        <table className={css.table}>
          <thead>
            <tr>
              <th>Название группы</th>
              <th>Кафедра / Факультет</th>
              <th>Студентов</th>
              <th style={{ textAlign: 'right' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => {
              const groupActions: ActionOption[] = [
                {
                  label: 'Детали',
                  icon: <FiInfo />,
                  onClick: () => handleShowDetails(group),
                },
                {
                  label: 'Редактировать',
                  icon: <FiEdit2 />,
                  onClick: () => handleEdit(group),
                },
                {
                  label: 'Удалить',
                  icon: <FiTrash2 />,
                  onClick: () => setGroupToDelete(group),
                  variant: 'danger',
                },
              ]

              return (
                <tr key={group.id}>
                  <td
                    className={css.studentName}
                    onClick={() => handleShowDetails(group)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={css.nameWithIcon}>
                      <FiUsers
                        className={css.entryIcon}
                        style={{ color: '#10b981', marginRight: '8px' }}
                      />
                      {group.name}
                    </div>
                  </td>
                  <td>
                    <div className={css.deptInfo}>
                      <div className={css.primaryText}>
                        {group.department.name}
                      </div>
                      <div className={css.secondaryText}>
                        {group.department.faculty.name}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={css.studentCountBadge}>
                      {group._count?.students || 0} чел.
                    </span>
                  </td>
                  <td className={css.actions}>
                    <ActionMenu options={groupActions} />
                  </td>
                </tr>
              )
            })) : (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#718096',
                  }}
                >
                  Группы не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Модалка создания/редактирования (Нужно будет создать GroupModal аналогично DepartmentModal) */}
      <GroupModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        group={selectedGroup}
      />

      {/* Модалка деталей */}
      <UniversalModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="О группе"
      >
        {viewingGroup && (
          <div className={css.studentInfoModal}>
            <div className={css.modalHeaderSection}>
              <div className={css.modalAvatar}>
                <FiBookOpen />
              </div>
              <h3>Группа {viewingGroup.name}</h3>
            </div>

            <div className={css.infoGrid}>
              <div className={css.infoItem}>
                <label>Факультет</label>
                <span>{viewingGroup.department.faculty.name}</span>
              </div>
              <div className={css.infoItem}>
                <label>Кафедра</label>
                <span>{viewingGroup.department.name}</span>
              </div>
              <div className={css.infoItem}>
                <label>Всего студентов</label>
                <span>{viewingGroup._count?.students || 0}</span>
              </div>
              <div className={css.infoItem}>
                <label>Дата создания</label>
                <span>
                  {new Date(viewingGroup.createdAt).toLocaleDateString(
                    'ru-RU'
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </UniversalModal>

      {/* Модалка удаления */}
      <UniversalModal
        isOpen={!!groupToDelete}
        onClose={() => setGroupToDelete(null)}
        title="Удаление группы"
        footer={
          <div className={css.modalFooter}>
            <button
              className={css.cancelBtn}
              onClick={() => setGroupToDelete(null)}
            >
              Отмена
            </button>
            <button
              className={css.dangerBtn}
              onClick={() => deleteMutation.mutate({ id: groupToDelete.id })}
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
            Удалить группу <b>{groupToDelete?.name}</b>?
          </p>
          <div className={css.statsHint}>
            Будет удалено каскадно:
            <ul>
              <li>Студентов: {deleteStats?.students || 0}</li>
            </ul>
          </div>
        </div>
      </UniversalModal>
    </div>
  )
})
