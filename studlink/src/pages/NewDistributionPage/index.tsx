import { zCreateDistributionTrpcInput } from '@parkstick/backend/src/router/createDistribution/input'
import { useFormik } from 'formik'
import { withZodSchema } from 'formik-validator-zod'
import { Input } from '../../components/Input'
import { Segment } from '../../components/Segment'
import { Textarea } from '../../components/Textarea'
import { trpc } from '../../lib/trpc'

export const NewDistributionPage = () => {
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

    validate: withZodSchema(
      zCreateDistributionTrpcInput
    ),

   onSubmit: async(values) => {
      await createDistribution.mutateAsync(values)
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
        <Input name="course" bottoms={['1', '2', '3', '4']} label="Курс" formik={formik} />
        <Input name="department" bottoms={['ТТФ', 'ФЛиСХ']} label="Кафедра" formik={formik} />
        <Input name="directions" bottoms={['ИСиТ']} label="Направление" formik={formik} />
        <Input name="group" bottoms={['315', '325', '335', '345']} label="Группа" formik={formik} />
        <Textarea name="message" label="Сообщение" formik={formik} />
        {!formik.isValid && !!formik.submitCount && <div style={{ color: 'red' }}>Заполните все поля</div>}
        <button type="submit">Отправить</button>
      </form>
    </Segment>
  )
}
