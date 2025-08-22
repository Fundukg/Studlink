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
        {dialogues.distributions.map((dialogues) => (
          <div className={css.idea} key={dialogues.recipient}>
            <Segment
              title={
                <Link className={css.ideaLink} to={getViewDialogueRoute({ Dialogue: dialogues.id })}>
                  {dialogues.recipient}
                </Link>
              }
              size={2}
              description={dialogues.text}
            />
          </div>
        ))}
      </div>
    </Segment>
  )
})
