import { zCreateDirectMessageTrpcInput } from '@parkstick/backend/src/router/createDirectMessage/input'
import { format, isToday } from 'date-fns'
import { useState } from 'react'
import { FiSearch, FiEdit, FiCheck } from 'react-icons/fi'
import { Link, useParams } from 'react-router-dom'
import { useForm } from '../../../lib/form'
import { getViewDialogueRoute } from '../../../lib/routes'
import { trpc } from '../../../lib/trpc'
import { Alert } from '../../Alert'
import { ButtonSend } from '../../Button'
import { List } from '../../List'
import { PlatformBadge } from '../../PlatformBadge'
import { PlatformSelector, type PlatformType } from '../../PlatformSelector'
import { Textarea } from '../../Textarea'
import { UniversalModal } from '../../UniversalModal'
import css from './index.module.scss'

export const DialogueSidebar = () => {
  const { id: activeId } = useParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)

  // Запрос списка студентов для селекта
  const { data: studentsData } = trpc.getStudent.useQuery()
  const createMessage = trpc.createDirectMessage.useMutation()
  const { data: dialoguesData, isLoading } = trpc.getDialogues.useQuery()

  const { formik, buttonProps, alertProps } = useForm({
    initialValues: {
      userId: '', // Имя поля должно совпадать с ожидаемым в zCreateDirectMessageTrpcInput
      text: '',
      platform: (localStorage.getItem('platform') as PlatformType) || 'ALL',
    },
    validationSchema: zCreateDirectMessageTrpcInput,
    onSubmit: async (values) => {
      await createMessage.mutateAsync(values)
      formik.resetForm()
      setTimeout(() => setIsNewMessageOpen(false), 1500)
    },
    successMessage: 'Сообщение отправлено!',
    showValidationAlert: true,
  })

  const handlePlatformChange = (p: PlatformType) => {
    formik.setFieldValue('platform', p)
    localStorage.setItem('platform', p)
  }

  // Подготовка списка студентов для компонента <List />
  // Компонент List ожидает массив объектов с id и name
  const studentOptions =
    studentsData?.students.map((s) => ({
      id: s.id,
      name: `${s.lastName} ${s.firstName} ${s.middleName || ''}`.trim(),
    })) || []

  const filteredDialogues = dialoguesData?.dialogues.filter((d) =>
    d.student.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <aside className={css.secondarySidebar}>
      <div className={css.sidebarHeader}>
        <div className={css.topRow}>
          <h2>Диалоги</h2>
          <button
            className={css.actionIcon}
            onClick={() => setIsNewMessageOpen(true)}
          >
            <FiEdit size={18} />
          </button>
        </div>

        <div className={css.searchWrapper}>
          <FiSearch className={css.searchIcon} />
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={css.dialogueList}>
        {isLoading && <div className={css.loading}>Загрузка...</div>}
        {filteredDialogues?.map((chat) => (
          <Link
            key={chat.id}
            to={getViewDialogueRoute({ dialogueId: chat.id })}
            className={`${css.dialogueItem} ${activeId === chat.id ? css.active : ''}`}
          >
            <div className={css.avatar}>
              <div className={css.initials}>
                {chat.student.name[0].toUpperCase()}
              </div>
              <PlatformBadge
                platform={chat.lastMessage.platform}
                className={css.platformPosition}
              />
            </div>
            <div className={css.chatContent}>
              <div className={css.chatHeader}>
                <span className={css.studentName}>{chat.student.name}</span>
                <span className={css.time}>
                  {isToday(new Date(chat.lastMessage.createdAt))
                    ? format(new Date(chat.lastMessage.createdAt), 'HH:mm')
                    : format(new Date(chat.lastMessage.createdAt), 'dd.MM')}
                </span>
              </div>
              <div className={css.lastMessageRow}>
                <p className={css.messagePreview}>{chat.lastMessage.text}</p>
                <FiCheck className={css.statusIcon} size={14} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <UniversalModal
        isOpen={isNewMessageOpen}
        onClose={() => setIsNewMessageOpen(false)}
        title="Новое сообщение"
        maxWidth={550}
        footer={
          <div style={{ width: '100%' }}>
            <Alert {...alertProps} />
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '10px',
              }}
            >
              <button
                className={css.cancelBtn}
                onClick={() => setIsNewMessageOpen(false)}
              >
                Отмена
              </button>
              <ButtonSend form="new-message-form" {...buttonProps}>
                Отправить
              </ButtonSend>
            </div>
          </div>
        }
      >
        <form
          id="new-message-form"
          onSubmit={formik.handleSubmit}
          className={css.form}
        >
          <div className={css.field}>
            <PlatformSelector
              value={formik.values.platform}
              dialogue={true}
              onChange={handlePlatformChange}
            />
          </div>
          <div className={css.field}>
            <List
              name="userId"
              listlabel="Выберите студента"
              formik={formik}
              groups={studentOptions}
              label="Получатель"
            />
          </div>
          <div className={css.field}>
            <Textarea name="text" formik={formik} label="Текст сообщения" />
          </div>
        </form>
      </UniversalModal>
    </aside>
  )
}
