import { Link } from 'react-router-dom'
import { Segment } from '../../components/Segment/index'
import { withPageWrapper } from '../../lib/pageWarpper'
import { getViewDialoguesRoute } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const WorkDeskPage = withPageWrapper({
  useQuery: () => trpc.getWorkDesk.useQuery(),
  setProps: ({ queryResult }) => ({
    dialogue: queryResult.data!,
  }),
})(({ dialogue }) => {
  return (
    <Segment title="WorkDesk">
      <div className={css.ideas}>
        {dialogue.Dialogue.map((dialogue) => (
          <div className={css.idea} key={dialogue.group}>
            <Segment
              title={
                <Link className={css.ideaLink} to={getViewDialoguesRoute({ Dialogue: dialogue.group })}>
                  {dialogue.group}
                </Link>
              }
              size={2}
              description={dialogue.department}
            />
          </div>
        ))}
      </div>
    </Segment>
  )
})
