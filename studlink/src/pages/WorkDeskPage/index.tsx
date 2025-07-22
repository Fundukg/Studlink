import { Link } from 'react-router-dom'
import { Segment } from '../../components/Segment/index'
import { getDialoguesRoute } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const WorkDeskPage = () => {
  const { data, error, isLoading, isFetching, isError } = trpc.getWorkDesk.useQuery()

  if (isLoading || isFetching) {
    return <span>Loading...</span>
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }

  return (
    <Segment title="WorkDesk">
      <div className={css.ideas}>
        {data!.Dialogue.map((dialogue) => (
          <div className={css.idea} key={dialogue.group}>
            <Segment
              title={
                <Link className={css.ideaLink} to={getDialoguesRoute({ Dialogue: dialogue.group})}>
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
}
