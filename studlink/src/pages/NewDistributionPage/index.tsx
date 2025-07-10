import { useState } from 'react'
import { Input } from '../../components/Input'
import { Segment } from '../../components/Segment'
import { Textarea } from '../../components/Textarea'

export const NewDistributionPage = () => {
  const [state, setState] = useState<Record<string, any>>({
    course: '',
    departament: '',
    directions: '',
    group: '',
    message: '',
    bottom: '',
  })

  return (
    <Segment title="Новая рассылка">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          console.info('Submitted', state)
        }}
      >
        <Input name="course" bottom={['1', '2', '3', '4']} label="Курс" state={state} setState={setState} />
        <Input name="departament" bottom={['TTФ', 'ФЛиСХ']} label="Кафедра" state={state} setState={setState} />
        <Input name="directions" bottom={['...']} label="Направление" state={state} setState={setState} />
        <Input name="group" bottom={['...']} label="Группа" state={state} setState={setState} />
        <Textarea name="message" label="Сообщение" state={state} setState={setState} />

        <button type="submit">Отправить</button>
      </form>
    </Segment>
  )
}
