import { zCreateDirectMessageTrpcInput } from '@parkstick/backend/src/router/createDirectMessage/input'
import { format, isToday } from 'date-fns'
import { useState, useEffect } from 'react'
import { FiSearch, FiEdit, FiCheck } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useSocket } from '../../../hooks/useSocket'
import { useForm } from '../../../lib/form'
import { getViewDialogueRoute } from '../../../lib/routes'
import { trpc } from '../../../lib/trpc'
import { Alert } from '../../Alert'
import { List } from '../../List'
import { PlatformBadge } from '../../PlatformBadge'
import { PlatformSelector, type PlatformType } from '../../PlatformSelector'
import { Textarea } from '../../Textarea'
import { UniversalModal } from '../../UniversalModal'
import css from './index.module.scss'

export const DialogueSidebar = () => {
  // const { id: activeId } = useParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)

  const utils = trpc.useUtils()
  const { socket } = useSocket() // Подключаем сокет
  
  // 2. Вытаскиваем ID напрямую из URL
  const activeId = location.pathname.includes('/dialogue/') 
    ? location.pathname.split('/dialogue/')[1] 
    : null

  useEffect(() => {
    const handleNewMessage = () => {
      // Когда пришло любое новое сообщение, обновляем весь список диалогов
      // Это обновит время и текст превью в сайдобаре
      utils.getDialogues.invalidate()
    }

    if (socket) {
      socket.on('new_message', handleNewMessage)
    }

    return () => {
      if (socket) {
        socket.off('new_message', handleNewMessage)
      }
    }
  }, [socket, utils])

  // 1. Сначала объявляем форму, чтобы получить доступ к formik
  const { formik, alertProps } = useForm({
    initialValues: {
      userId: '',
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

  // 2. Теперь можем безопасно использовать formik
  const selectedUserId = formik.values.userId

  const { data: studentsData } = trpc.getStudent.useQuery()
  const { data: dialoguesData, isLoading } = trpc.getDialogues.useQuery()

  const { data: studentQuery } = trpc.getOneStudent.useQuery(
    { id: selectedUserId },
    { enabled: !!selectedUserId }
  )

  const availablePlatforms =
    studentQuery?.botUsers.map((bu) => bu.bot.platform) || []

  // Эффект для сброса платформы, если выбранный студент её не поддерживает
  useEffect(() => {
    if (selectedUserId && availablePlatforms.length > 0) {
      if (
        formik.values.platform !== 'ALL' &&
        !availablePlatforms.includes(formik.values.platform)
      ) {
        handlePlatformChange('ALL')
      }
    }
  }, [selectedUserId, availablePlatforms])

  const createMessage = trpc.createDirectMessage.useMutation({
    onSuccess: () => {
      utils.getDialogues.invalidate()
    },
  })

  const handlePlatformChange = (p: PlatformType) => {
    formik.setFieldValue('platform', p)
    localStorage.setItem('platform', p)
  }

  const studentOptions =
    studentsData?.students.map((s) => ({
      id: s.id,
      name: `${s.lastName} ${s.firstName} ${s.middleName || ''}`.trim(),
    })) || []

  const filteredDialogues = dialoguesData?.dialogues.filter((d) =>
    d.student.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const hasDialogues =
    dialoguesData?.dialogues && dialoguesData.dialogues.length > 0

  return (
    <aside className={`${css.secondarySidebar} ${activeId ? css.hiddenOnMobile : ''}`}>
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
        {hasDialogues && (
          <div className={css.searchWrapper}>
            <FiSearch className={css.searchIcon} />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className={css.dialogueList}>
        {isLoading ? (
          <div className={css.loading}>Загрузка...</div>
        ) : !hasDialogues ? (
          <div className={css.emptyState}>
            <div className={css.emptyIcon}>💬</div>
            <p className={css.emptyTitle}>Сообщений пока нет</p>
            <button
              className={css.startButton}
              onClick={() => setIsNewMessageOpen(true)}
            >
              Написать сообщение
            </button>
          </div>
        ) : filteredDialogues?.length === 0 ? (
          <div className={css.noResults}>Ничего не найдено</div>
        ) : (
          filteredDialogues?.map((chat) => (
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
          ))
        )}
      </div>

      <UniversalModal
        isOpen={isNewMessageOpen}
        onClose={() => setIsNewMessageOpen(false)}
        title="Новое сообщение"
        maxWidth={550}
        footer={
          <div className={css.modalFooter}>
            <button
              type="button"
              className={css.cancelBtn}
              onClick={() => setIsNewMessageOpen(false)}
            >
              Отмена
            </button>
            <button
              type="submit"
              form="new-message-form"
              className={css.submitBtn}
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        }
      >
        <form
          id="new-message-form"
          onSubmit={formik.handleSubmit}
          className={css.form}
        >
          <div className={css.alertPlaceholder}>
            <Alert {...alertProps} />
          </div>

          <div className={css.field}>
            <PlatformSelector
              value={formik.values.platform}
              dialogue={true}
              onChange={handlePlatformChange}
              availablePlatforms={availablePlatforms}
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