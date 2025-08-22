import { zCreateDistributionTrpcInput } from '@parkstick/backend/src/router/createDistribution/input'
import { useEffect } from 'react'
import { Alert } from '../../components/Alert'
import { ButtonSend } from '../../components/Button'
import { FormItems } from '../../components/FormItems'
import { List, ListSelect } from '../../components/List'
import { Segment } from '../../components/Segment'
import { Textarea } from '../../components/Textarea'
import { useForm } from '../../lib/form'
import { withPageWrapper } from '../../lib/pageWarpper'
import { trpc } from '../../lib/trpc'

export const NewDistributionPage = withPageWrapper({
  authorizedOnly: true,
})(() => {
  const createDistribution = trpc.createDistribution.useMutation()
  const groupQuery = trpc.getGroup.useQuery() // Предполагается, что у вас есть такой запрос
  const studentQuery = trpc.getStudent.useQuery() // Предполагается, что у вас есть такой запрос
  const departmentQuery = trpc.getDepartment.useQuery() // Предполагается, что у вас есть такой запрос
  const facultieQuery = trpc.getFaculty.useQuery() // Предполагается, что у вас есть такой запрос

  const { formik, buttonProps, alertProps } = useForm({
    initialValues: {
      targetType: 'ALL',
      targetId: '',
      text: '',
    },
    validationSchema: zCreateDistributionTrpcInput,
    onSubmit: async (values) => {
      await createDistribution.mutateAsync(values)
      formik.resetForm()
    },
    successMessage: 'Рассылка успешно создана',
    showValidationAlert: true,
  })

  // Сбросить targetId при изменении типа получателя
  useEffect(() => {
    formik.setFieldValue('targetId', '')
  }, [formik.values.targetType])

  return (
    <Segment title="Новая рассылка">
      <form onSubmit={formik.handleSubmit}>
        <FormItems>
          {/* Выбор типа получателя */}
          <ListSelect
            formik={formik}
            name="targetType"
            label="Тип получателя"
            options={[
              { value: 'ALL', label: 'Всем' },
              { value: 'STUDENT', label: 'Студент' },
              { value: 'GROUP', label: 'Группа' },
              { value: 'DEPARTMENT', label: 'Кафедра' },
              { value: 'FACULTY', label: 'Факультет' },
            ]}
          />
          {/* Поле для выбора конкретного получателя в зависимости от типа */}
          {formik.values.targetType === 'STUDENT' && (
            <List
              name="targetId"
              label="Студент"
              listlabel="Выберите студента"
              formik={formik}
              groups={studentQuery.data?.Student || []}
            />
          )}

          {formik.values.targetType === 'GROUP' && (
            <List
              name="targetId"
              label="Группа"
              listlabel="Выберите Группу"
              formik={formik}
              groups={groupQuery.data || []}
            />
          )}

          {formik.values.targetType === 'DEPARTMENT' && (
            <List
              name="targetId"
              label="Кафедра"
              listlabel="Выберите Кафедру"
              formik={formik}
              groups={departmentQuery.data || []}
            />
          )}

          {formik.values.targetType === 'FACULTY' && (
            <List
              name="targetId"
              label="Факультет"
              listlabel="Выберите Факультет"
              formik={formik}
              groups={facultieQuery.data || []}
            />
          )}

          <Textarea name="text" label="Сообщение" formik={formik} />
          <Alert {...alertProps} />
          <ButtonSend {...buttonProps}>Отправить</ButtonSend>
        </FormItems>
      </form>
    </Segment>
  )
})
