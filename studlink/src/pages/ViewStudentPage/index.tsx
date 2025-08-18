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
              <th>ID</th>
              <th>ФИО</th>
              <th>Дата создания</th>
              <th>Курс</th>
              <th>Факультет</th>
              <th>Направление</th>
              <th>Группа</th>
              <th>Номер студ. билета</th>
            </tr>
          </thead>
          <tbody>
            {student.Student.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                <td>{student.course}</td>
                <td>{student.department}</td>
                <td>{student.directions}</td>
                <td>{student.group}</td>
                <td>{student.student_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* {student.Student.map((student) => (
        <div key={student.id}>
          <p>{student.name}</p>
          <p>{student.student_id}</p>
          <p>{student.course}</p>
          <p>{student.department}</p>
          <p>{student.directions}</p>
          <p>{student.group}</p>
        </div>
      ))} */}
    </Segment>
  )
})
