import { Link, Outlet } from 'react-router-dom'
import { getDialoguesRoute, getWorkDesk } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import { Segment } from '../Segment'
import css from './index.module.scss'

export const DialoguesBar = () => {
  const { data, isLoading, error } = trpc.getWorkDesk.useQuery()
  if (isLoading) {
    return <div>Loading navigation...</div>
  }
  if (error) {
    return <div>Error: {error.message}</div>
  }
  if (!data?.dialogue) {
    return <div>Dialogue not found</div>
  }

  return (
    <div className={css.layout}>
      <div className={css.navigation}>
        <ul className={css.menu}>
          <li className={css.item}>
            <div className={css.ideas}>
              <Link className={css.link} to={getWorkDesk()}>
                Work Desk
              </Link>
              {data!.dialogue.map((workdesk) => (
                <div className={css.idea} key={workdesk.course}>
                  <Segment
                    title={
                      <Link className={css.ideaLink} to={getDialoguesRoute({ Dialogue: workdesk.course})}>
                        {workdesk.departament}
                      </Link>
                    }
                    size={2}
                    description={workdesk.group}
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
