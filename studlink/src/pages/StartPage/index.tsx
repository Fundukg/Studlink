// pages/dialogues/start.tsx
import { FiMessageCircle } from 'react-icons/fi'
import { withPageWrapper } from '../../lib/pageWarpper'
import css from './index.module.scss'

const StartDialoguesPage = withPageWrapper({
  authorizedOnly: true,
})(() => {
  // const navigate = useNavigate()
  // const handleSelectStudent = () => {
  //   // Перенаправляем на страницу со списком студентов (замените путь на реальный)
  //   navigate(
  //     getViewDialogueRoute({
  //       dialogueId: recentChats.data?.dialogues[0].id,
  //     })
  //   )
  // }

  return (
    <div className={css.container}>
      <div className={css.card}>
        <div className={css.iconWrapper}>
          <FiMessageCircle className={css.icon} />
        </div>
        <h1 className={css.title}>Добро пожаловать!</h1>
        <p className={css.subtitle}>
          Вы используете сервис рассылки сообщений.
          <br />ВКурсе сообщений пока нет.
        </p>
        <p className={css.hint}>
          Для начала выберите студента и напишите ему первое сообщение.
        </p>
        {/* <button className={css.button} onClick={handleSelectStudent}>
          <FiUserPlus className={css.buttonIcon} />
          Выбрать студента
        </button> */}
      </div>
    </div>
  )
})

export default StartDialoguesPage
