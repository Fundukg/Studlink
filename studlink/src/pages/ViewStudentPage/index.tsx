import { useState } from 'react'
import { FiSearch, FiPlus, FiUsers, FiBook, FiLayers, FiBookOpen, FiUserPlus } from 'react-icons/fi'
import { CreateForm } from '../../components/AddForm'
import { DataTable } from '../../components/DataTable'
import { withPageWrapper } from '../../lib/pageWarpper'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

type TabType = 'students' | 'groups' | 'faculties' | 'departments' | 'employees'

// Функции для получения русских названий
const getSearchPlaceholder = (tab: TabType): string => {
  switch (tab) {
    case 'students': return 'Поиск студентов...'
    case 'groups': return 'Поиск групп...'
    case 'faculties': return 'Поиск факультетов...'
    case 'departments': return 'Поиск кафедр...'
    case 'employees': return 'Поиск сотрудников...'
    default: return 'Поиск...'
  }
}

const getAddButtonText = (tab: TabType): string => {
  switch (tab) {
    case 'students': return 'Добавить студента'
    case 'groups': return 'Добавить группу'
    case 'faculties': return 'Добавить факультет'
    case 'departments': return 'Добавить кафедру'
    case 'employees': return 'Добавить сотрудника'
    default: return 'Добавить'
  }
}

const ViewStudentPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('students')
  const [isCreating, setIsCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Запросы данных
  const studentsQuery = trpc.getStudent.useQuery()
  const groupsQuery = trpc.getGroup.useQuery()
  const facultiesQuery = trpc.getFaculty.useQuery()
  const departmentsQuery = trpc.getDepartment.useQuery()
  const staffQuery = trpc.getStaff.useQuery()

  // Получение данных в зависимости от активной вкладки
  const getActiveData = () => {
    switch (activeTab) {
      case 'students':
        return studentsQuery.data?.Student || []
      case 'groups':
        return groupsQuery.data?.Group || []
      case 'faculties':
        return facultiesQuery.data?.Faculty || []
      case 'departments':
        return departmentsQuery.data?.Department || []
      case 'employees':
        return staffQuery.data?.Staff || []
      default:
        return []
    }
  }

  const activeData = getActiveData()

  // Фильтрация данных по поисковому запросу
  const filteredData = activeData.filter((item: any) => {
    if (!searchTerm) {
      return true
    }

    const searchLower = searchTerm.toLowerCase()
    switch (activeTab) {
      case 'students':
        return item.name.toLowerCase().includes(searchLower) || 
               item.student_id.toLowerCase().includes(searchLower)
      case 'groups':
        return item.name.toLowerCase().includes(searchLower) || 
               item.department?.name.toLowerCase().includes(searchLower)
      case 'departments':
        return item.name.toLowerCase().includes(searchLower) || 
               item.faculty?.name.toLowerCase().includes(searchLower)
      case 'faculties':
        return item.name.toLowerCase().includes(searchLower)
      case 'employees':
        return item.nick.toLowerCase().includes(searchLower)
      default:
        return true
    }
  })

  return (
    <div className={css.container}>
      <div className={css.header}>
        <h1>Управление пользователями</h1>
        <p>Управление студентами, группами, факультетами, кафедрами и сотрудниками</p>
      </div>

      <div className={css.tabs}>
        <button
          className={`${css.tab} ${activeTab === 'students' ? css.active : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <FiUsers className={css.tabIcon} />
          Студенты
        </button>
        <button
          className={`${css.tab} ${activeTab === 'groups' ? css.active : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          <FiLayers className={css.tabIcon} />
          Группы
        </button>
        <button
          className={`${css.tab} ${activeTab === 'faculties' ? css.active : ''}`}
          onClick={() => setActiveTab('faculties')}
        >
          <FiBook className={css.tabIcon} />
          Факультеты
        </button>
        <button
          className={`${css.tab} ${activeTab === 'departments' ? css.active : ''}`}
          onClick={() => setActiveTab('departments')}
        >
          <FiBookOpen className={css.tabIcon} />
          Кафедры
        </button>
        <button
          className={`${css.tab} ${activeTab === 'employees' ? css.active : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          <FiUserPlus className={css.tabIcon} />
          Сотрудники
        </button>
      </div>

      <div className={css.content}>
        <div className={css.actions}>
          <div className={css.searchContainer}>
            <FiSearch className={css.searchIcon} />
            <input
              type="text"
              placeholder={getSearchPlaceholder(activeTab)}
              className={css.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className={css.addButton} onClick={() => setIsCreating(true)}>
            <FiPlus className={css.addIcon} />
            {getAddButtonText(activeTab)}
          </button>
        </div>

        {isCreating ? (
          <CreateForm
            type={activeTab}
            onCancel={() => setIsCreating(false)}
            onSuccess={() => {
              setIsCreating(false)
              // Инвалидация кэша для обновления данных
              studentsQuery.refetch()
              groupsQuery.refetch()
              facultiesQuery.refetch()
              departmentsQuery.refetch()
              staffQuery.refetch()
            }}
          />
        ) : (
          <DataTable type={activeTab} data={filteredData} />
        )}
      </div>
    </div>
  )
}

export default withPageWrapper({
  authorizedOnly: true,
})(ViewStudentPage)