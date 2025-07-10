import { useFormik } from 'formik'
import { Input } from '../../components/Input'
import { Segment } from '../../components/Segment'
import { Textarea } from '../../components/Textarea'

export const NewDistributionPage = () => {
  const formik = useFormik({
    initialValues: {
      course: '',
      departament: '',
      directions: '',
      group: '',
      message: '',
      bottom: '',
    },
    onSubmit: (values) => {
      console.info('Submitted', values)
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
        <Input name="departament" bottoms={['TTФ', 'ФЛиСХ']} label="Кафедра" formik={formik} />
        <Input name="directions" bottoms={['...']} label="Направление" formik={formik} />
        <Input name="group" bottoms={['...']} label="Группа" formik={formik} />
        <Textarea name="message" label="Сообщение" formik={formik} />
        <button type="submit">Отправить</button>
      </form>
    </Segment>
  )
}
