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
        {data!.WorkDesk.map((workdesk) => (
          <div className={css.idea} key={workdesk.nick}>
            <Segment
              title={
                <Link className={css.ideaLink} to={getDialoguesRoute({ workdesk: workdesk.nick })}>
                  {workdesk.name}
                </Link>
              }
              size={2}
              description={workdesk.description}
            />
          </div>
        ))}
      </div>
    </Segment>
  )
}
