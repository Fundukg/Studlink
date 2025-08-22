import { format } from 'date-fns/format'
import { useParams } from 'react-router-dom'
import { ButtomLink } from '../../components/Button'
import { Segment } from '../../components/Segment'
import { withPageWrapper } from '../../lib/pageWarpper'
import { getEditMessageRoute, type ViewDialogueRouteParams } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const ViewDialoguePage = withPageWrapper({
  authorizedOnly: true,
  useQuery: () => {
    const { Dialogue: dialogueId } = useParams() as ViewDialogueRouteParams
    return trpc.getDialogue.useQuery({
      distributionId: dialogueId,
    })
  },
  setProps: ({ queryResult, ctx, checkExists }) => ({
    dialogue: checkExists(queryResult.data.distribution, 'Dialogue not found'),
    me: ctx.me,
  }),
})(({ dialogue, me }) => (
  <div className={css.dialogue}>
    <Segment title={dialogue.recipient.name} size={1}>
      <div className={css.createdAt}>Дата отправки: {format(dialogue.createdAt, 'yyyy-MM-dd HH:mm')}</div>
      <div className={css.author}>От: {dialogue.sender.name}</div>
      <div className={css.text} dangerouslySetInnerHTML={{ __html: dialogue.text }} />
    </Segment>
    {me?.id === dialogue.sender.id && (
      <div className={css.editButton}>
        <ButtomLink to={getEditMessageRoute({ dialogueId: dialogue.id })}>Редактировать</ButtomLink>
      </div>
    )}
  </div>
))
