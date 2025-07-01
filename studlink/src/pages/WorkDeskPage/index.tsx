import { Link } from 'react-router-dom'
import { getDialoguesRoute } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const WorkDeskPage = () => {
  const { data, error, isLoading, isFetching, isError } = trpc.getWorkDeskRoute.useQuery()

  if (isLoading || isFetching) {
    return <span>Loading...</span>
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }

  return (
    <div>
      <h1 className={css.title}>All Ideas</h1>
      <div className={css.ideas}>
        {data!.WorkDesk.map((workdesk) => (
          <div className={css.idea} key={workdesk.nick}>
            <h2 className={css.ideaName}>
              <Link className={css.ideaLink} to={getDialoguesRoute({ workdesk: workdesk.nick })}>
                {workdesk.name}
              </Link>
            </h2>
            <p className={css.ideaDescription}>{workdesk.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
