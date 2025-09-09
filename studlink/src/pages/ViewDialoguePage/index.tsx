import { format } from 'date-fns/format'
import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { withPageWrapper } from '../../lib/pageWarpper'
import { type ViewDialogueRouteParams } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const ViewDialoguePage = withPageWrapper({
  authorizedOnly: true,
  useQuery: () => {
    const { dialogueId } = useParams() as ViewDialogueRouteParams
    return trpc.getDialogue.useQuery({
      distributionId: dialogueId,
    })
  },
  setProps: ({ queryResult, ctx, checkExists }) => ({
    dialogue: checkExists(queryResult.data.dialogue, 'Dialogue not found'),
    me: ctx.me,
  }),
})(({ dialogue }) => {
  const createDistribution = trpc.createDistribution.useMutation()
  const { dialogueId } = useParams() as ViewDialogueRouteParams
  const trpcUtils = trpc.useContext()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messageText, setMessageText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null) // Добавляем тип для textareaRef

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [dialogue.messages])

  // Автоматическое изменение высоты textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [messageText])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!messageText.trim()) {return}
    
    try {
      await createDistribution.mutateAsync({
        targetType: 'STUDENT',
        targetId: dialogue.recipient.id,
        text: messageText,
      })

      // Обновляем данные диалога после отправки сообщения
      await trpcUtils.getDialogue.invalidate({ distributionId: dialogueId })
      setMessageText('')
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
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
          <div className={css.avatar}>
            {dialogue.recipient.name.charAt(0).toUpperCase()}
          </div>
          <div className={css.userDetails}>
            <h2>{dialogue.recipient.name}</h2>
            <p>Диалог с участником</p>
          </div>
        </div>
      </div>

      <div className={css.messagesWrapper}>
        <div className={css.messages}>
          {dialogue.messages.length === 0 ? (
            <div className={css.emptyState}>
              <div className={css.emptyIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.9706 20 12 20C10.4607 20 9.01172 19.6565 7.74467 19.0511L3 20L4.39499 16.28C3.51156 15.0423 3 13.5743 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Нет сообщений</h3>
              <p>Начните диалог, отправив первое сообщение</p>
            </div>
          ) : (
            dialogue.messages.map((message) => (
              <div
                key={message.id}
                className={`${css.message} ${message.sender.type === 'STAFF' ? css.staffMessage : css.studentMessage}`}
              >
                <div className={css.messageContent}>
                  <div className={css.messageHeader}>
                    <span className={css.senderName}>
                      {message.sender.name}
                      {message.sender.type === 'STUDENT' && ` (${message.sender.studentId})`}
                    </span>
                    <span className={css.messageTime}>{format(message.createdAt, 'HH:mm')}</span>
                  </div>
                  <div className={css.messageText} dangerouslySetInnerHTML={{ __html: message.text }} />
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className={css.messageInputContainer}>
        <form onSubmit={handleSubmit} className={css.messageForm}>
          <div className={css.inputWrapper}>
            <textarea
              ref={textareaRef} // Используем ref с правильным типом
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Введите сообщение..."
              className={css.textArea}
              rows={1}
            />
            <button 
              type="submit" 
              className={css.sendButton}
              disabled={!messageText.trim()}
              title="Отправить сообщение"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
})