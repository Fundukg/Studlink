import { zCreateDepartmentTrpcInput } from '@parkstick/backend/src/router/createDepartment/input'
import { format } from 'date-fns'
import { Alert } from '../../components/Alert'
import { ButtonSend } from '../../components/Button'
import { FormItems } from '../../components/FormItems'
import { Input } from '../../components/Input'
import { List } from '../../components/List'
import { Segment } from '../../components/Segment'
import { useForm } from '../../lib/form'
import { withPageWrapper } from '../../lib/pageWarpper'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const NewDepartmentPage = withPageWrapper({
  authorizedOnly: true,
  useQuery: () => trpc.getDepartment.useQuery(),
  setProps: ({ queryResult }) => ({
    department: queryResult.data!,
  }),
})((Department) => {
  const createDepartment = trpc.createDepartment.useMutation()
  const trpcUtils = trpc.useContext()
  const { formik, buttonProps, alertProps } = useForm({
    initialValues: {
      name: '',
      facultyId: '',
    },
    validationSchema: zCreateDepartmentTrpcInput,
    onSubmit: async (values) => {
      await createDepartment.mutateAsync(values)
      formik.resetForm()
      void trpcUtils.getDepartment.invalidate()
    },
    successMessage: 'Кафедра успешно создана',
    showValidationAlert: true,
  })

  return (
    <Segment title="Новыая кафедра">
      <form onSubmit={formik.handleSubmit}>
        <FormItems>
          <Input name="name" label="Кафедра" formik={formik} />

          <List
            name="facultyId"
            label="Факультет"
            listlabel="Выберите Факультет"
            formik={formik}
            groups={Department.department.map((department) => department.faculty)}
          />

          <Alert {...alertProps} />
          <ButtonSend {...buttonProps}>Создать</ButtonSend>
        </FormItems>
      </form>
      <div className={css.tableContainer}>
        <table className={css.studentsTable}>
          <thead>
            <tr>
              <th>№</th>
              <th>Кафедра</th>
              <th>Факультет</th>
              <th>Дата создания</th>
            </tr>
          </thead>
          <tbody>
            {Department.department?.map((faculty, index) => (
              <tr key={faculty.id}>
                <td>{index + 1}</td>
                <td>{faculty.name}</td>
                <td>{faculty.faculty.name}</td>
                <td>{format(faculty.createdAt, 'dd.MM.yyyy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Segment>
  )
})
