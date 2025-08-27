import { format } from 'date-fns/format'
import { useParams } from 'react-router-dom'
// import { ButtomLink } from '../../components/Button'
import { Segment } from '../../components/Segment'
import { withPageWrapper } from '../../lib/pageWarpper'
import { type ViewDistributionRouteParams } from '../../lib/routes' //import { getEditMessageRoute, type ViewDistributionRouteParams } from '../../lib/routes'
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
})(
  (
    { distribution } //{ distribution, me }
  ) => (
    <div className={css.distribution}>
      <Segment title={distribution.recipient.name} size={1}>
        <div className={css.distributionHeader}>
          <div className={css.createdAt}>{`Отправлено: ${format(distribution.createdAt, 'yyyy-MM-dd HH:mm')}`}</div>
          <div className={css.senderInfo}>{`Отправитель: ${distribution.sender.name}`}</div>
        </div>

        {/* Отображаем все сообщения рассылки и ответы на нее */}
        <div className={css.messages}>
          {distribution.messages.map((message) => (
            <div
              key={message.id}
              className={`${css.message} ${message.isDistribution ? css.distributionMessage : ''} ${message.sender.type === 'STAFF' ? css.staffMessage : css.studentMessage}`}
            >
              <div className={css.messageHeader}>
                <span className={css.senderName}>
                  {message.sender.name}
                  {message.sender.type === 'STUDENT' && message.sender.studentId && ` (${message.sender.studentId})`}
                  {message.sender.type === 'STUDENT' && message.sender.group && `, ${message.sender.group}`}
                </span>
                <span className={css.senderType}>({message.sender.type === 'STAFF' ? 'Сотрудник' : 'Студент'})</span>
                <span className={css.messageDate}>{format(message.createdAt, 'yyyy-MM-dd HH:mm')}</span>
                {message.isDistribution && <span className={css.distributionBadge}>Исходная рассылка</span>}
              </div>
              <div className={css.messageText} dangerouslySetInnerHTML={{ __html: message.text }} />
            </div>
          ))}
        </div>
      </Segment>

      {/* Кнопка редактирования показывается только для создателя рассылки */}
      {/* {me?.id === distribution.sender.id && (
      <div className={css.editButton}>
        <ButtomLink to={getEditMessageRoute({ dialogueId: distribution.id })}>Редактировать рассылку</ButtomLink>
      </div>
    )} */}
    </div>
  )
)
