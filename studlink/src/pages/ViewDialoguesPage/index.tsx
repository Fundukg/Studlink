import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { Segment } from '../../components/Segment/index'
import { withPageWrapper } from '../../lib/pageWarpper'
import { getViewDialogueRoute } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const ViewDialoguesPage = withPageWrapper({
  useQuery: () => trpc.getDialogues.useQuery(),

  setProps: ({ queryResult }) => ({
    dialogues: queryResult.data!,
  }),
})(({ dialogues }) => {
  return (
    <Segment title="Диалоги">
      <div className={css.ideas}>
        {dialogues.distributions.map((dialogue) => (
          <div className={css.idea} key={dialogue.student.name}>
            <Segment
              title={
                <Link
                  className={css.ideaLink}
                  to={getViewDialogueRoute({
                    dialogueId: dialogue.id,
                  })}
                >
                  {dialogue.student.name} {dialogue.student.studentId}
                </Link>
              }
              size={2}
              description={`${dialogue.lastMessage.text} ${format(dialogue.lastMessage.createdAt, 'HH:mm')}`}
            />
          </div>
        ))}
      </div>
    </Segment>
  )
})
