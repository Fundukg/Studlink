import { format } from 'date-fns'
import { FiUsers } from 'react-icons/fi'
import css from './index.module.scss'

type TabType = 'students' | 'groups' | 'faculties' | 'departments' | 'employees'
// Компонент таблицы данных
export const DataTable = ({ type, data }: { type: TabType; data: any[] }) => {
  if (data.length === 0) {
    return (
      <div className={css.emptyState}>
        <div className={css.emptyIcon}>
          <FiUsers size={48} />
        </div>
        <h3>Нет {getRussianPlural(type)}</h3>
        <p>В настоящее время нет {getRussianPlural(type)} для отображения.</p>
      </div>
    )
  }
//  output: {
//         Student: {
//             name: string;
//             id: string;
//             createdAt: Date;
//             course: string;
//             group: {
//                 name: string;
//                 id: string;
//                 department: {
//                     name: string;
//                     id: string;
//                     faculty: {
//                         name: string;
//                         id: string;
//                     };
//                 };
//             } | null;
//             student_id: string;
//             botUsers: {
//                 bot: {
//                     name: string;
//                     id: string;
//                     platform: $Enums.BotPlatform;
//                 };
//                 externalId: string;
  switch (type) {
    case 'students':
      return (
        <div className={css.cardList}>
          {data.map((student) => (
            <div key={student.id} className={css.card}>
              <div className={css.cardHeader}>
                <h3>{student.name}</h3>
                <span className={css.cardBadge}>
                  {student.group?.department.faculty.name} - {student.course} курс
                </span>
              </div>
              <div className={css.cardContent}>
                <p><strong>ID студента:</strong> {student.student_id}</p>
                <p><strong>Группа:</strong> {student.group?.name}</p>
                <p><strong>Кафедра:</strong> {student.group?.department.name}</p>
                <p><strong>Факультет:</strong> {student.group?.department.faculty.name}</p>
                <p><strong>Телефон:</strong> {student.phone}</p>
                <p><strong>Электронная почта:</strong> {student.pathname}</p>
              </div>
              <div className={css.cardFooter}>
                <span>Создано: {format(student.createdAt, 'dd.MM.yyyy')}</span>
                <button className={css.editButton}>Редактировать</button>
              </div>
            </div>
          ))}
        </div>
      )
    case 'groups':
      return (
        <div className={css.tableContainer}>
          <table className={css.dataTable}>
            <thead>
              <tr>
                <th>№</th>
                <th>Группа</th>
                <th>Кафедра</th>
                <th>Факультет</th>
                <th>Дата создания</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {data.map((group, index) => (
                <tr key={group.id}>
                  <td>{index + 1}</td>
                  <td>{group.name}</td>
                  <td>{group.department?.name}</td>
                  <td>{group.department?.faculty.name}</td>
                  <td>{format(group.createdAt, 'dd.MM.yyyy')}</td>
                  <td>
                    <button className={css.editButton}>Редактировать</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'departments':
      return (
        <div className={css.tableContainer}>
          <table className={css.dataTable}>
            <thead>
              <tr>
                <th>№</th>
                <th>Название</th>
                <th>Дата создания</th>
                <th>Факультет</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{format(item.createdAt, 'dd.MM.yyyy')}</td>
                  <td>{item.faculty?.name}</td>
                  <td>
                    <button className={css.editButton}>Редактировать</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'employees':
      return (
        <div className={css.tableContainer}>
          <table className={css.dataTable}>
            <thead>
              <tr>
                <th>№</th>
                <th>Имя пользователя</th>
                <th>Дата создания</th>
                <th>Отправлено сообщений</th>
                <th>Получено сообщений</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {data.map((staff, index) => (
                <tr key={staff.id}>
                  <td>{index + 1}</td>
                  <td>{staff.nick}</td>
                  <td>{format(staff.createdAt, 'dd.MM.yyyy')}</td>
                  <td>{staff.sentMessages?.length || 0}</td>
                  <td>{staff.receivedMessages?.length || 0}</td>
                  <td>
                    <button className={css.editButton}>Редактировать</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'faculties':
      return (
        <div className={css.tableContainer}>
          <table className={css.dataTable}>
            <thead>
              <tr>
                <th>№</th>
                <th>Название</th>
                <th>Дата создания</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{format(item.createdAt, 'dd.MM.yyyy')}</td>
                  <td>
                    <button className={css.editButton}>Редактировать</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    default:
      return (
        <div className={css.tableContainer}>
          <table className={css.dataTable}>
            <thead>
              <tr>
                <th>№</th>
                <th>Название</th>
                <th>Дата создания</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{format(item.createdAt, 'dd.MM.yyyy')}</td>
                  <td>
                    <button className={css.editButton}>Редактировать</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}

// Вспомогательная функция для получения правильной формы множественного числа
function getRussianPlural(type: TabType): string {
  switch (type) {
    case 'students': return 'студентов'
    case 'groups': return 'групп'
    case 'faculties': return 'факультетов'
    case 'departments': return 'кафедр'
    case 'employees': return 'сотрудников'
    default: return 'данных'
  }
}