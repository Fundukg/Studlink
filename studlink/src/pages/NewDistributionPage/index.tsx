import { zCreateDistributionTrpcInput } from '@parkstick/backend/src/router/createDistribution/input'
import { FiSend } from 'react-icons/fi'
import { Alert } from '../../components/Alert'
import { Input } from '../../components/Input'
import { List, ListSelect } from '../../components/List'
import { MailingHeader } from '../../components/MailingHeader'
import { Textarea } from '../../components/Textarea'
import { useForm } from '../../lib/form'
import { withPageWrapper } from '../../lib/pageWarpper'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'
// Страница создания новой рассылки
export const NewDistributionPage = withPageWrapper({
  authorizedOnly: true,
})(() => {
  const createDistribution = trpc.createDistribution.useMutation()
  const groupQuery = trpc.getGroup.useQuery()
  const studentQuery = trpc.getStudent.useQuery()
  const departmentQuery = trpc.getDepartment.useQuery()
  const facultieQuery = trpc.getFaculty.useQuery()

  const { formik, alertProps } = useForm({ // buttonProps,
    initialValues: {
      // subject: '',
      targetType: 'ALL',
      targetId: '',
      text: '',
    },
    validationSchema: zCreateDistributionTrpcInput,
    onSubmit: async (values) => {
      await createDistribution.mutateAsync(values)
      formik.resetForm()
    },
    successMessage: 'Mailing successfully sent',
    showValidationAlert: true,
  })

  return (
    <div className={css.container}>
      <MailingHeader />

      <div className={css.content}>
        <h2 className={css.sectionTitle}>Написать новое письмо</h2>

        <form onSubmit={formik.handleSubmit} className={css.form}>
          {/* <div className={css.formSection}>
            <label className={css.label}>Subject</label>
            <Input 
              name="subject" 
              formik={formik} 
              listlabel="Enter mailing subject..."
              label=""
            />
          </div> */}

          <div className={css.formSection}>
            <label className={css.label}>Получатели</label>
            <ListSelect
              formik={formik}
              name="targetType"
              options={[
                { value: 'ALL', label: 'Все пользователи' },
                { value: 'STUDENT', label: 'Студенты' },
                { value: 'GROUP', label: 'Группы' },
                { value: 'DEPARTMENT', label: 'Кафедры' },
                { value: 'FACULTY', label: 'Факультеты' },
                { value: 'COURSE', label: 'Курсы' },
              ]}
              label=""
            />

            {formik.values.targetType === 'STUDENT' && (
              <List
                name="targetId"
                listlabel="Выберите Студента"
                formik={formik}
                groups={studentQuery.data?.Student || []}
                label=""
              />
            )}

            {formik.values.targetType === 'GROUP' && (
              <List name="targetId" listlabel="Выберите Группу" formik={formik} groups={groupQuery.data || []} label="" />
            )}

            {formik.values.targetType === 'DEPARTMENT' && (
              <List
                name="targetId"
                listlabel="Выберите Кафедру"
                formik={formik}
                groups={departmentQuery.data || []}
                label=""
              />
            )}

            {formik.values.targetType === 'FACULTY' && (
              <List
                name="targetId"
                listlabel="Выберите Факультет"
                formik={formik}
                groups={facultieQuery.data || []}
                label=""
              />
            )}

            {formik.values.targetType === 'COURSE' && (
              <Input name="targetId" formik={formik} label="" listlabel="Введите номер курса" />
            )}
          </div>

          <div className={css.formSection}>
            <label className={css.label}>Содержание сообщения</label>
            <Textarea name="text" formik={formik} label="" listlabel="Введите текст вашего сообщения..." />
          </div>

          <Alert {...alertProps} />

          <div className={css.buttonGroup}>
            {/* <button type="button" className={css.draftButton}>
              Save as Draft
            </button> */}
            <button type="submit" className={css.sendButton}>
              <FiSend className={css.icon} /> Send Mailing
            </button>
          </div>
        </form>
      </div>
    </div>
  )
})
