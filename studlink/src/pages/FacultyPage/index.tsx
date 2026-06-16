import { useState, useMemo } from 'react'
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiBriefcase,
  FiInfo,
  FiLayers,
  FiUsers,
  FiAlertTriangle,
} from 'react-icons/fi'
import { ActionMenu } from '../../components/ActionMenu' // Наш новый компонент
import { FacultyModal } from '../../components/Create-UpdateModal/FacultyModal'
import { UniversalModal } from '../../components/UniversalModal'
import { UniversalTable, type Column } from '../../components/UniversalTable'
import { withPageWrapper } from '../../lib/pageWarpper'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const FacultyPage = withPageWrapper({
  useQuery: () => trpc.getFaculty.useQuery(),
  setProps: ({ queryResult }) => ({
    data: queryResult.data,
  }),
})(({ data: facultiesData }) => {
  const utils = trpc.useUtils()

  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null)
  const [facultyToDelete, setFacultyToDelete] = useState<any>(null)

  // Состояние для модалки деталей
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [viewingFaculty, setViewingFaculty] = useState<any>(null)

  const filteredFaculties = useMemo(() => {
    if (!facultiesData?.Faculty) {
      return []
    }
    return facultiesData.Faculty.filter((f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [facultiesData, searchQuery])

  const deleteMutation = trpc.deleteFaculty.useMutation({
    onSuccess: () => {
      utils.getFaculty.invalidate()
      setFacultyToDelete(null)
    },
    onError: (err) => alert(err.message),
  })

  const { data: deleteStats } = trpc.getFacultyDeleteStats.useQuery(
    { id: facultyToDelete?.id },
    { enabled: !!facultyToDelete }
  )

  const handleEdit = (faculty: any) => {
    setSelectedFaculty(faculty)
    setIsModalOpen(true)
  }

  const handleShowDetails = (faculty: any) => {
    setViewingFaculty(faculty)
    setIsDetailsOpen(true)
  }

  const columns: Column<any>[] = [
    {
      header: 'Название факультета',
      width: '25%',
      render: (faculty) => (
        <div
          className={css.facultyName}
          onClick={() => handleShowDetails(faculty)}
          style={{ cursor: 'pointer' }}
        >
          <div className={css.nameWithIcon}>
            <FiBriefcase className={css.entryIcon} />
            {faculty.name}
          </div>
        </div>
      ),
    },
    {
      header: 'Кафедр',
      render: (faculty) => faculty._count?.departments || 0,
    },
    {
      header: 'Действия',
      align: 'right',
      render: (faculty) => (
        <ActionMenu
          options={[
            {
              label: 'Детали',
              icon: <FiInfo />,
              onClick: () => handleShowDetails(faculty),
            },
            {
              label: 'Редактировать',
              icon: <FiEdit2 />,
              onClick: () => handleEdit(faculty),
            },
            {
              label: 'Удалить',
              icon: <FiTrash2 />,
              onClick: () => setFacultyToDelete(faculty),
              variant: 'danger',
            },
          ]}
        />
      ),
    },
  ]

  return (
    <div className={css.container}>
      {/* Хедер остается без изменений */}
      <div className={css.header}>
        <div className={css.titleBlock}>
          <h1>Факультеты</h1>
          <span className={css.countBadge}>{filteredFaculties.length}</span>
        </div>
        <div className={css.controls}>
          <div className={css.searchWrapper}>
            <FiSearch className={css.searchIcon} />
            <input
              type="text"
              placeholder="Поиск факультета..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={css.searchInput}
            />
          </div>
          <button
            className={css.addBtn}
            onClick={() => {
              setSelectedFaculty(null)
              setIsModalOpen(true)
            }}
          >
            <FiPlus /> Добавить факультет
          </button>
        </div>
      </div>

      <div className={css.tableWrapper}>
        <UniversalTable
          data={filteredFaculties}
          columns={columns}
          emptyMessage="Факультеты не найдены"
        />
      </div>

      {/* Модалка редактирования */}
      <FacultyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        faculty={selectedFaculty}
      />

      {/* --- НОВАЯ МОДАЛКА ДЕТАЛЕЙ --- */}
      <UniversalModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Информация о факультете"
        maxWidth={500}
      >
        {viewingFaculty && (
          <div className={css.detailsContent}>
            <div className={css.detailsHeader}>
              <div className={css.bigIcon}>
                <FiBriefcase />
              </div>
              <h2>{viewingFaculty.name}</h2>
            </div>

            <div className={css.statsGrid}>
              <div className={css.statCard}>
                <FiLayers />
                <div className={css.statInfo}>
                  <label>Кафедры</label>
                  <span>{viewingFaculty._count?.departments || 0}</span>
                </div>
              </div>
              {/* Если в схеме есть счетчики групп/студентов, можно добавить их сюда */}
              <div className={css.statCard}>
                <FiUsers />
                <div className={css.statInfo}>
                  <label>ID Системы</label>
                  <span className={css.idText}>
                    {viewingFaculty.id.substring(0, 8)}...
                  </span>
                </div>
              </div>
            </div>

            <div className={css.additionalInfo}>
              <label>Дата создания</label>
              <p>
                {new Date(viewingFaculty.createdAt).toLocaleDateString(
                  'ru-RU'
                )}
              </p>
            </div>
          </div>
        )}
      </UniversalModal>

      {/* Модалка удаления */}
      <UniversalModal
        isOpen={!!facultyToDelete}
        onClose={() => setFacultyToDelete(null)}
        title="Удаление факультета"
        footer={
          <div className={css.modalFooter}>
            <button
              className={css.cancelBtn}
              onClick={() => setFacultyToDelete(null)}
            >
              Отмена
            </button>
            <button
              className={css.dangerBtn}
              onClick={() => deleteMutation.mutate({ id: facultyToDelete.id })}
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
            Вы уверены, что хотите удалить <b>{facultyToDelete?.name}</b>?
          </p>
          <div className={css.statsHint}>
            Это действие затронет:
            <ul>
              <li>Связанные кафедры: {deleteStats?.departments || 0}</li>
              <li>Связанные группы: {deleteStats?.groups || 0}</li>
            </ul>
          </div>
        </div>
      </UniversalModal>
    </div>
  )
})
