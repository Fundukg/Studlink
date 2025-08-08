import { zCreateDistributionTrpcInput } from '@parkstick/backend/src/router/createDistribution/input'
import { Alert } from '../../components/Alert'
import { ButtonSend } from '../../components/Button'
import { FormItems } from '../../components/FormItems'
import { Input } from '../../components/Input'
import { Segment } from '../../components/Segment'
import { Textarea } from '../../components/Textarea'
import { useForm } from '../../lib/form'
import { withPageWrapper } from '../../lib/pageWarpper'
import { trpc } from '../../lib/trpc'

export const NewDistributionPage = withPageWrapper({ 
  authorizedOnly: true 
})(() => {
  const createDistribution = trpc.createDistribution.useMutation()
  const {formik, buttonProps, alertProps} = useForm({
    initialValues: {
      course: '',
      department: '',
      directions: '',
      group: '',
      message: '',
    },

    validationSchema: zCreateDistributionTrpcInput,

    onSubmit: async (values) => {
        await createDistribution.mutateAsync(values)
        formik.resetForm()
    },
    successMessage: 'Рассылка успешно создана',
    showValidationAlert: true,
  })

  return (
    <Segment title="Новая рассылка">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          formik.handleSubmit()
        }}
      >
        <FormItems>
        <Input name="course" bottoms={['1', '2', '3', '4']} label="Курс" formik={formik} />
        <Input name="department" bottoms={['ТТФ', 'ФЛиСХ']} label="Кафедра" formik={formik} />
        <Input name="directions" bottoms={['ИСиТ']} label="Направление" formik={formik} />
        <Input name="group" bottoms={['315', '325', '335', '345']} label="Группа" formik={formik} maxWidth={500} />
        <Textarea name="message" label="Сообщение" formik={formik} />
        <Alert {...alertProps} />
        <ButtonSend {...buttonProps}>Отправить</ButtonSend>
        </FormItems>
      </form>
    </Segment>
  )
})
