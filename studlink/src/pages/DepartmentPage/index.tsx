import { useState, useMemo } from 'react'
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiLayers,
  FiInfo,
  FiBriefcase,
  FiAlertTriangle,
} from 'react-icons/fi'
import { ActionMenu, type ActionOption } from '../../components/ActionMenu'
import { DepartmentModal } from '../../components/Create-UpdateModal/DepartmentModal' // Предполагается наличие этого компонента
import { UniversalModal } from '../../components/UniversalModal'
import { withPageWrapper } from '../../lib/pageWarpper'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const DepartmentPage = withPageWrapper({
  useQuery: () => trpc.getDepartment.useQuery(),
  setProps: ({ queryResult }) => ({
    data: queryResult.data,
  }),
})(({ data: departmentsData }) => {
  const utils = trpc.useUtils()

  // Данные
  const [searchQuery, setSearchQuery] = useState('')

  // Состояния модалок
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedDept, setSelectedDept] = useState<any>(null)

  const [deptToDelete, setDeptToDelete] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [viewingDept, setViewingDept] = useState<any>(null)

  // Фильтрация
  const filteredDepartments = useMemo(() => {
    if (!departmentsData?.Department) {
      return []
    }
    return departmentsData.Department.filter(
      (d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.faculty.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [departmentsData, searchQuery])

  // Удаление
  const deleteMutation = trpc.deleteDepartment.useMutation({
    onSuccess: () => {
      utils.getDepartment.invalidate()
      setDeptToDelete(null)
    },
    onError: (err) => alert(err.message),
  })

  // Статистика перед удалением
  const { data: deleteStats } = trpc.getDepartmentDeleteStats.useQuery(
    { id: deptToDelete?.id },
    { enabled: !!deptToDelete }
  )
  const handleEdit = (dept: any) => {
    setSelectedDept(dept)
    setIsEditModalOpen(true)
  }

  const handleShowDetails = (dept: any) => {
    setViewingDept(dept)
    setIsDetailsOpen(true)
  }

  return (
    <div className={css.container}>
      <div className={css.header}>
        <div className={css.titleBlock}>
          <h1>Кафедры</h1>
          <span className={css.countBadge}>{filteredDepartments.length}</span>
        </div>

        <div className={css.controls}>
          <div className={css.searchWrapper}>
            <FiSearch className={css.searchIcon} />
            <input
              type="text"
              placeholder="Поиск кафедры или факультета..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={css.searchInput}
            />
          </div>
          <button
            className={css.addBtn}
            onClick={() => {
              setSelectedDept(null)
              setIsEditModalOpen(true)
            }}
          >
            <FiPlus /> Добавить кафедру
          </button>
        </div>
      </div>

      <div className={css.tableWrapper}>
        <table className={css.table}>
          <thead>
            <tr>
              <th>Название кафедры</th>
              <th>Факультет</th>
              <th style={{ textAlign: 'right' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.length > 0 ? (
    filteredDepartments.map((dept) => {
              const deptActions: ActionOption[] = [
                {
                  label: 'Детали',
                  icon: <FiInfo />,
                  onClick: () => handleShowDetails(dept),
                },
                {
                  label: 'Редактировать',
                  icon: <FiEdit2 />,
                  onClick: () => handleEdit(dept),
                },
                {
                  label: 'Удалить',
                  icon: <FiTrash2 />,
                  onClick: () => setDeptToDelete(dept),
                  variant: 'danger',
                },
              ]

              return (
                <tr key={dept.id}>
                  <td
                    className={css.studentName}
                    onClick={() => handleShowDetails(dept)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={css.nameWithIcon}>
                      <FiLayers
                        className={css.entryIcon}
                        style={{ color: '#10b981', marginRight: '8px' }}
                      />
                      {dept.name}
                    </div>
                  </td>
                  <td>
                    <div className={css.facultyBadge}>
                      <FiBriefcase size={12} /> {dept.faculty.name}
                    </div>
                  </td>
                  <td className={css.actions}>
                    <ActionMenu options={deptActions} />
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
                  Кафедры не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Модалка создания/редактирования */}
      <DepartmentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        department={selectedDept}
      />

      {/* Модалка деталей */}
      <UniversalModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Информация о кафедре"
      >
        {viewingDept && (
          <div className={css.studentInfoModal}>
            <div className={css.modalHeaderSection}>
              <div className={css.modalAvatar}>
                <FiLayers />
              </div>
              <h3>{viewingDept.name}</h3>
              <div className={css.studentIdBadge}>
                ID: {viewingDept.id.substring(0, 8)}
              </div>
            </div>

            <div className={css.infoGrid}>
              <div className={css.infoItem}>
                <label>Факультет</label>
                <span>{viewingDept.faculty.name}</span>
              </div>
              <div className={css.infoItem}>
                <label>Дата создания</label>
                <span>
                  {new Date(viewingDept.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>
          </div>
        )}
      </UniversalModal>

      {/* Модалка удаления */}
      <UniversalModal
        isOpen={!!deptToDelete}
        onClose={() => setDeptToDelete(null)}
        title="Удаление кафедры"
        footer={
          <div className={css.modalFooter}>
            <button
              className={css.cancelBtn}
              onClick={() => setDeptToDelete(null)}
            >
              Отмена
            </button>
            <button
              className={css.dangerBtn}
              onClick={() => deleteMutation.mutate({ id: deptToDelete.id })}
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
            Вы уверены, что хотите удалить кафедру <b>{deptToDelete?.name}</b>?
          </p>
          <div className={css.statsHint}>
            Удаление приведет к каскадному удалению:
            <ul>
              <li>Групп: {deleteStats?._count.groups || 0}</li>
            </ul>
          </div>
        </div>
      </UniversalModal>
    </div>
  )
})
