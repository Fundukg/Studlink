import { format } from 'date-fns/format'
import { useParams } from 'react-router-dom'
import { ButtomLink } from '../../components/Button'
import { Segment } from '../../components/Segment'
import { withPageWrapper } from '../../lib/pageWarpper'
import { getEditMessageRoute, type ViewDialoguesRouteParams } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const DialoguesPage = withPageWrapper({
  authorizedOnly: true,
  useQuery: () => {
    const { Dialogue: workdesk } = useParams() as ViewDialoguesRouteParams
    return trpc.getDialogues.useQuery({
      dialogue: workdesk,
    })
  },
  checkExists: ({ queryResult }) => !!queryResult.data.Dialogue,
  checkExistsMessage: 'Dialogue not found',
  setProps: ({ queryResult, ctx }) => ({
    dialogue: queryResult.data.Dialogue!,
    me: ctx.me,
  }),
})(({ dialogue, me }) => (
  <div className={css.dialogue}>
    <Segment title={dialogue.course} size={1} description={dialogue.department}>
      <div className={css.createdAt}>Дата отправки: {format(dialogue.createdAt, 'yyyy-MM-dd')} </div>
      <div className={css.author}>От: {dialogue.author.nick}</div>
      <div className={css.text} dangerouslySetInnerHTML={{ __html: dialogue.message }} />
    </Segment>
    {me?.id === dialogue.authorId && (
      <div className={css.editButton}>
        <ButtomLink to={getEditMessageRoute({ dialogueId: dialogue.group })}>Редактировать</ButtomLink>
      </div>
    )}
  </div>
))
