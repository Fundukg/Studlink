import { format } from 'date-fns'
import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import { PlatformBadge } from '../../components/PlatformBadge'
import { PlatformSelector } from '../../components/PlatformSelector'
import { UniversalModal } from '../../components/UniversalModal'
import { withPageWrapper } from '../../lib/pageWarpper'
import { type ViewDialogueRouteParams } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const ViewDialoguePage = withPageWrapper({
  authorizedOnly: true,
  useQuery: () => {
    const { dialogueId } = useParams() as ViewDialogueRouteParams
    return trpc.getDialogue.useQuery({
      studentId: dialogueId,
    })
  },
  setProps: ({ queryResult, ctx, checkExists }) => ({
    dialogue: checkExists(queryResult.data.dialogue, 'Dialogue not found'),
    me: ctx.me,
  }),
})(({ dialogue }) => {
  const createDirectMessage = trpc.createDirectMessage.useMutation()
  const { dialogueId } = useParams() as ViewDialogueRouteParams
  const trpcUtils = trpc.useContext()

  const { data: studentQuery } = trpc.getOneStudent.useQuery({
    id: dialogueId,
  })

  // Вспомогательная константа для обращения к профилю (учитывая ошибки TS)
  const profile = studentQuery?.studentProfile

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [messageText, setMessageText] = useState('')
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)

  type PlatformType = 'ALL' | 'TELEGRAM' | 'VK' | 'OK'
  const [platform, setPlatform] = useState<PlatformType>(() => {
    const saved = localStorage.getItem('platform') as PlatformType
    return ['TELEGRAM', 'VK', 'OK', 'ALL'].includes(saved) ? saved : 'ALL'
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [dialogue.messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [messageText])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim()) {
      return
    }

    const sendPromise = createDirectMessage.mutateAsync({
      userId: dialogue.recipient.id,
      text: messageText,
      platform: platform,
    })

    try {
      await toast.promise(sendPromise, {
        loading: 'Отправка...',
        success: 'Сообщение отправлено',
        error: 'Ошибка при отправке',
      })
      await trpcUtils.getDialogue.invalidate({ studentId: dialogueId })
      setMessageText('')
    } catch (error) {
      console.error('Ошибка отправки:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className={css.dialogueContainer}>
      <div className={css.dialogueHeader}>
        <div className={css.userInfo}>
          <div
            className={css.avatar}
            onClick={() => setIsStudentModalOpen(true)}
            style={{ cursor: 'pointer' }}
          >
            {dialogue.recipient.name.charAt(0).toUpperCase()}
          </div>
          <div className={css.userDetails}>
            <h2
              onClick={() => setIsStudentModalOpen(true)}
              style={{ cursor: 'pointer' }}
            >
              {dialogue.recipient.name}
            </h2>
            <p>Онлайн • {profile?.group?.name || 'Загрузка...'}</p>
          </div>
        </div>
        <div className={css.headerActions}>
          <PlatformSelector
            value={platform}
            dialogue={true}
            onChange={setPlatform}
          />
        </div>
      </div>

      <div className={css.messagesWrapper}>
        <div className={css.messages}>
          {dialogue.messages.map((message) => {
            // Исправлено: используем sender.role (или как определено в вашей схеме), так как 'type' отсутствует
            const isStaff =
              message.sender.role === 'ADMIN' ||
              message.sender.role === 'DEANERY' ||
              message.sender.role === 'TEACHER'
            return (
              <div
                key={message.id}
                className={`${css.message} ${isStaff ? css.staffMessage : css.studentMessage}`}
              >
                <div className={css.messageContent}>
                  <div className={css.messageHeader}>
                    <span className={css.senderName}>
                      {message.sender.name}
                    </span>
                    <div className={css.meta}>
                      <span className={css.messageTime}>
                        {format(new Date(message.createdAt), 'HH:mm')}
                      </span>
                      <PlatformBadge
                        platform={message.platform}
                        className={css.badge}
                      />
                    </div>
                  </div>
                  <div
                    className={css.messageText}
                    dangerouslySetInnerHTML={{ __html: message.text }}
                  />
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className={css.messageInputContainer}>
        <form onSubmit={handleSubmit} className={css.messageForm}>
          <div className={css.inputWrapper}>
            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напишите сообщение..."
              className={css.textArea}
              rows={1}
            />
            <button
              type="submit"
              className={css.sendButton}
              disabled={!messageText.trim()}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>

      <UniversalModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        title="Информация о студенте"
        maxWidth={500}
      >
        <div className={css.studentInfoModal}>
          <div className={css.modalAvatar}>
            {dialogue.recipient.name.charAt(0).toUpperCase()}
          </div>
          <h3>{dialogue.recipient.name}</h3>
          <div className={css.infoGrid}>
            <div className={css.infoItem}>
              <label>ID Студента</label>
              {/* Исправлено: доступ к ID через studentProfile или напрямую */}
              <span>{profile?.student_id || '—'}</span>
            </div>
            <div className={css.infoItem}>
              <label>Факультет</label>
              <span>{profile?.group?.department?.faculty?.name || '—'}</span>
            </div>
            <div className={css.infoItem}>
              <label>Кафедра</label>
              <span>{profile?.group?.department?.name || '—'}</span>
            </div>
            <div className={css.infoItem}>
              <label>Группа</label>
              <span>{profile?.group?.name || '—'}</span>
            </div>
            <div className={css.infoItem}>
              <label>Курс</label>
              <span>{profile?.course || '—'} курс</span>
            </div>
            <div className={css.divider} />
            <div className={css.infoItem}>
              <label>Платформы</label>
              <div className={css.platformsList}>
                {studentQuery?.botUsers.map((bu) => (
                  <PlatformBadge
                    key={bu.id}
                    platform={bu.bot.platform}
                    size="sm"
                  />
                ))}
              </div>
            </div>
            <div className={css.infoItem}>
              <label>Сообщений</label>
              <div className={css.stats}>
                <span>Вы: {studentQuery?._count.receivedMessages}</span>
                <span>Он: {studentQuery?._count.sentMessages}</span>
              </div>
            </div>
          </div>
        </div>
      </UniversalModal>
    </div>
  )
})
