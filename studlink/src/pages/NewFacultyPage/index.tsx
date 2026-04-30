import { zCreateFacultyTrpcInput } from '@parkstick/backend/src/router/createFaculty/input'
import { format } from 'date-fns'
import { Alert } from '../../components/Alert'
import { ButtonSend } from '../../components/Button'
import { FormItems } from '../../components/FormItems'
import { Input } from '../../components/Input'
import { Segment } from '../../components/Segment'
import { useForm } from '../../lib/form'
import { withPageWrapper } from '../../lib/pageWarpper'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const NewFacultyPage = withPageWrapper({
  authorizedOnly: true,
  useQuery: () => trpc.getFaculty.useQuery(),
  setProps: ({ queryResult }) => ({
    Faculty: queryResult.data!,
  }),
})((faculty) => {
  const createFaculty = trpc.createFaculty.useMutation()
  const trpcUtils = trpc.useContext()
  const { formik, buttonProps, alertProps } = useForm({
    initialValues: {
      name: '',
    },
    validationSchema: zCreateFacultyTrpcInput,
    onSubmit: async (values) => {
      await createFaculty.mutateAsync(values)
      formik.resetForm()
      void trpcUtils.getFaculty.invalidate()
    },
    successMessage: 'Факультет успешно создан',
    showValidationAlert: true,
  })

  return (
    <Segment title="Новый факультет">
      <form onSubmit={formik.handleSubmit}>
        <FormItems>
          <Input name="name" label="Факультет" formik={formik} />
          <Alert {...alertProps} />
          <ButtonSend {...buttonProps}>Создать</ButtonSend>
        </FormItems>
      </form>
      <div className={css.tableContainer}>
        <table className={css.studentsTable}>
          <thead>
            <tr>
              <th>№</th>
              <th>Факультет</th>
              <th>Дата создания</th>
            </tr>
          </thead>
          <tbody>
            {faculty.Faculty?.Faculty.map((faculty, index) => (
              <tr key={faculty.id}>
                <td>{index + 1}</td>
                <td>{faculty.name}</td>
                <td>{format(faculty.createdAt, 'dd.MM.yyyy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Segment>
  )
})
