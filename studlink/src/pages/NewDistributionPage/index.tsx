import { useFormik } from 'formik'
import { withZodSchema } from 'formik-validator-zod'
import { z } from 'zod'
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

    validate: withZodSchema(
      z.object({
        course: z.string().min(1).max(4),
        departament: z
          .string()
          .min(1)
          .regex(/^[a-zА-Яа-я0-9-]+$/, 'Directions contain only lowercase letters number and dashes')
          .max(10),
        directions: z
          .string()
          .min(1)
          .regex(/^[a-zА-Яа-я0-9-]+$/, 'Directions contain only lowercase letters number and dashes')
          .max(10),
        group: z
          .string()
          .min(1)
          .regex(/^[a-zА-Яа-я0-9-]+$/, 'Directions contain only lowercase letters number and dashes')
          .max(10),
        message: z.string().min(1, 'Message should be at least 10 characters long'),
        bottom: z.string().min(1),
      })
    ),

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
        {!formik.isValid && !!formik.submitCount && <div style={{ color: 'red' }}>Заполните все поля</div>}
        <button type="submit">Отправить</button>
      </form>
    </Segment>
  )
}
