import { format } from 'date-fns'
import { Segment } from '../../components/Segment'
import { withPageWrapper } from '../../lib/pageWarpper'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const ViewStudentPage = withPageWrapper({
  authorizedOnly: true,
  useQuery: () => trpc.getStudent.useQuery(),
  setProps: ({ queryResult }) => ({
    student: queryResult.data!,
  }),
  
})(({ student }) => {
  return (
    <Segment title="Студенты">
      <div className={css.tableContainer}>
        <table className={css.studentsTable}>
          <thead>
            <tr>
              <th>№</th>
              <th>ФИО</th>
              <th>Дата создания</th>
              <th>Курс</th>
              <th>Кафедра</th>
              <th>Факультет</th>
              <th>Группа</th>
              <th>Номер студ. билета</th>
            </tr>
          </thead>
          <tbody>
            {student.Student.map((student, index) => (
              <tr key={student.id}>
                <td>{index + 1}</td>
                <td>{student.name}</td>
                <td>{format(student.createdAt, 'dd.MM.yyyy')}</td>
                <td>{student.course}</td>
                <td>{student.group?.department.name}</td>
                <td>{student.group?.department.faculty.name}</td>
                <td>{student.group?.name}</td>
                <td>{student.student_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
     
    </Segment>
  )
})
