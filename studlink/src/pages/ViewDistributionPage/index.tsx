import { format } from 'date-fns/format'
import { FiUser, FiClock, FiSend } from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'
import { withPageWrapper } from '../../lib/pageWarpper'
import { type ViewDistributionRouteParams } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const ViewDistributionPage = withPageWrapper({
  authorizedOnly: true,
  useQuery: () => {
    const { distributionId } = useParams() as ViewDistributionRouteParams
    return trpc.getDistribution.useQuery({
      distributionId: distributionId,
    })
  },
  setProps: ({ queryResult, ctx, checkExists }) => ({
    distribution: checkExists(queryResult.data?.distribution, 'Distribution not found'),
    me: ctx.me,
  }),
})(({ distribution }) => {
  const navigate = useNavigate()

  const handleClose = () => {
    navigate(-1) // Возврат на предыдущую страницу
  }

  return (
    <div className={css.modalOverlay} onClick={handleClose}>
      <div className={css.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={css.distributionHeader}>
          <div className={css.recipientInfo}>
            <div className={css.avatar}>
              <FiUser />
            </div>
            <div className={css.recipientDetails}>
              <h2>{distribution.recipient.name}</h2>
              <p>Детали рассылки</p>
            </div>
          </div>

          <div className={css.distributionMeta}>
            <div className={css.metaItem}>
              <FiClock className={css.metaIcon} />
              <span className={css.metaValue}>{format(distribution.createdAt, 'dd.MM.yyyy HH:mm')}</span>
            </div>
            <div className={css.metaItem}>
              <FiSend className={css.metaIcon} />
              <span className={css.metaValue}>{distribution.sender.name}</span>
            </div>
          </div>
        </div>

        <div className={css.messageContent}>
          <h3 className={css.messageTitle}>Сообщение рассылки</h3>
          <div
            className={css.messageText}
            dangerouslySetInnerHTML={{
              __html: distribution.messages.find((m) => m.isDistribution)?.text || 'Нет содержимого',
            }}
          />
        </div>

        <div className={css.responsesSection}>
          <h3 className={css.responsesTitle}>
            Ответы ({distribution.messages.filter((m) => !m.isDistribution).length})
          </h3>

          {distribution.messages.filter((m) => !m.isDistribution).length === 0 ? (
            <div className={css.emptyState}>
              <div className={css.emptyIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.9706 20 12 20C10.4607 20 9.01172 19.6565 7.74467 19.0511L3 20L4.39499 16.28C3.51156 15.0423 3 13.5743 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z"
                    stroke="#A0AEC0"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p>На эту рассылку пока нет ответов</p>
            </div>
          ) : (
            <div className={css.responsesList}>
              {distribution.messages
                .filter((m) => !m.isDistribution)
                .map((message) => (
                  <div
                    key={message.id}
                    className={`${css.message} ${message.sender.type === 'STAFF' ? css.staffMessage : css.studentMessage}`}
                  >
                    <div className={css.messageHeader}>
                      <span className={css.senderName}>
                        {message.sender.name}
                        {message.sender.type === 'STUDENT' &&
                          message.sender.studentId &&
                          ` (${message.sender.studentId})`}
                        {message.sender.type === 'STUDENT' && message.sender.group && `, ${message.sender.group}`}
                      </span>
                      <div className={css.messageMeta}>
                        <span className={css.senderType}>
                          {message.sender.type === 'STAFF' ? 'Сотрудник' : 'Студент'}
                        </span>
                        <span className={css.messageDate}>{format(message.createdAt, 'HH:mm')}</span>
                      </div>
                    </div>
                    <div className={css.messageText} dangerouslySetInnerHTML={{ __html: message.text }} />
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
