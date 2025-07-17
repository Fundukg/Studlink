import { zCreateDistributionTrpcInput } from '@parkstick/backend/src/router/createDistribution/input'
import { useFormik } from 'formik'
import { withZodSchema } from 'formik-validator-zod'
import { useState } from 'react'
import { Alert } from '../../components/Alert'
import { ButtonSend } from '../../components/ButtonSend'
import { FormItems } from '../../components/FormItems'
import { Input } from '../../components/Input'
import { Segment } from '../../components/Segment'
import { Textarea } from '../../components/Textarea'
import { trpc } from '../../lib/trpc'

export const NewDistributionPage = () => {
  const [successMessage, setSuccessMessage] = useState(false)
  const [sabmittingError, setSubmittingError] = useState<string | null>(null)
  const createDistribution = trpc.createDistribution.useMutation()
  const formik = useFormik({
    initialValues: {
      course: '',
      department: '',
      directions: '',
      group: '',
      message: '',
      bottom: '',
    },

    validate: withZodSchema(zCreateDistributionTrpcInput),

    onSubmit: async (values) => {
      try {
        await createDistribution.mutateAsync(values)
        formik.resetForm()
        setSuccessMessage(true)
        setTimeout(() => {
          setSuccessMessage(false)
        }, 3000)
      } catch (error: any) {
        setSubmittingError(error.message)
        setTimeout(() => {
          setSubmittingError(null)
        }, 3000)
      }
    },
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
        {/* {!formik.isValid && !!formik.submitCount && <div style={{ color: 'red' }}>Заполните все поля</div>} */}
        {!formik.isValid && !!formik.submitCount && <Alert color='red'>Заполните все поля</Alert>}
        {/* {!!sabmittingError && <div style={{ color: 'red' }}>{sabmittingError}</div>} */}
        {!!sabmittingError && <Alert color='red'>{sabmittingError}</Alert>}
        {/* {successMessage && <div style={{ color: 'green' }}>Рассылка отправлена!</div>} */}
        {successMessage && <Alert color='green'>Рассылка отправлена!</Alert>}
        {/* <button type="submit" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? 'Отправка...' : 'Отправить'}
        </button> */}
        <ButtonSend loading={formik.isSubmitting}>Отправить</ButtonSend>
        </FormItems>
      </form>
    </Segment>
  )
}
