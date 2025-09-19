import { zCreateGroupTrpcInput } from '@parkstick/backend/src/router/createGroup/input'
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

export const NewGroupPage = withPageWrapper({
  authorizedOnly: true,
  useQuery: () => trpc.getGroup.useQuery(),
  setProps: ({ queryResult }) => ({
    group: queryResult.data!,
  }),
})((Group) => {
  const createGroup = trpc.createGroup.useMutation()
  const queryDepartment = trpc.getDepartment.useQuery()
  const trpcUtils = trpc.useContext()
  const { formik, buttonProps, alertProps } = useForm({
    initialValues: {
      name: '',
      departmentId: '',
    },
    validationSchema: zCreateGroupTrpcInput,
    onSubmit: async (values) => {
      await createGroup.mutateAsync(values)
      formik.resetForm()
      void trpcUtils.getGroup.invalidate()
    },
    successMessage: 'Группа успешно создана',
    showValidationAlert: true,
  })

  return (
    <Segment title="Новыая группа">
      <form onSubmit={formik.handleSubmit}>
        <FormItems>
          <Input name="name" label="Группа" formik={formik} />

          <List
            name="departmentId"
            label="Кафедра"
            listlabel="Выберите Кафедру"
            formik={formik}
            groups={queryDepartment.data?.Department || []}
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
              <th>Группа</th>
              <th>Кафедра</th>
              <th>Факультет</th>
              <th>Дата создания</th>
            </tr>
          </thead>
          <tbody>
            {Group.group?.Group.map((group, index) => (
              <tr key={group.id}>
                <td>{index + 1}</td>
                <td>{group.name}</td>
                <td>{group.department.name}</td>
                <td>{group.department.faculty.name}</td>
                <td>{format(group.createdAt, 'dd.MM.yyyy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Segment>
  )
})
