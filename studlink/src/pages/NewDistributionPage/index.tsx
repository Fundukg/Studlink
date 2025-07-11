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
    validate: (values) => {
      const errors: Partial<typeof values> = {}
      if (!values.course) {
        errors.course = 'Course is required'
      }
      if (!values.departament) {
        errors.departament = 'Departament is required'
      } else if (!values.departament.match(/^[a-zА-Яа-я0-9-]+$/)) {
        errors.departament = 'Directions contain only lowercase letters number and dashes'
      }

      if (!values.directions) {
        errors.directions = 'Directionsis required'
      } else if (!values.directions.match(/^[a-zА-Яа-я0-9-]+$/)) {
        errors.directions = 'Directions contain only lowercase letters number and dashes'
      }

      if (!values.group) {
        errors.group = 'Group is required'
      } else if (!values.group.match(/^[a-zА-Яа-я0-9-.]+$/)) {
        errors.group = 'Group contain only lowercase letters number and dashes'
      }
      if (!values.message) {
        errors.message = 'Message is required'
      } else if (values.message.length < 10) {
        errors.message = 'Message should be at least 10 characters long'
      }
      return errors
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
        <Input name="departament" bottoms={['ТТФ', 'ФЛиСХ']} label="Кафедра" formik={formik} />
        <Input name="directions" bottoms={['ИСиТ']} label="Направление" formik={formik} />
        <Input name="group" bottoms={['315', '325', '335', '345']} label="Группа" formik={formik} />
        <Textarea name="message" label="Сообщение" formik={formik} />
        {!formik.isValid && !!formik.submitCount&&<div style={{ color: 'red' }}>Заполните все поля</div>}
        <button type="submit">Отправить</button>
      </form>
    </Segment>
  )
}
