import { Link, Outlet } from 'react-router-dom'
import { getDialoguesRoute, getWorkDeskRoute } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import { Segment } from '../Segment'
import css from './index.module.scss'

export const DialoguesBar = () => {
  const { data, isLoading, error } = trpc.getWorkDeskRoute.useQuery()
  if (isLoading) {
    return <div>Loading navigation...</div>
  }
  if (error) {
    return <div>Error: {error.message}</div>
  }
  if (!data?.WorkDesk) {
    return <div>Dialogue not found</div>
  }

  return (
    <div className={css.layout}>
      <div className={css.navigation}>
        <ul className={css.menu}>
          <li className={css.item}>
            <div className={css.ideas}>
              <Link className={css.link} to={getWorkDeskRoute()}>
                Work Desk
              </Link>
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
          </li>
        </ul>
      </div>
      <Outlet />
    </div>
  )
}
