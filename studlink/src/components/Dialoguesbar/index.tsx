import { Link, Outlet } from 'react-router-dom'
import { getViewDialogueRoute, getViewDialoguesRoute } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import { Segment } from '../Segment'
import css from './index.module.scss'

export const DialoguesBar = () => {
  const { data, isLoading, error } = trpc.getDialogues.useQuery()
  if (isLoading) {
    return <div>Loading navigation...</div>
  }
  if (error) {
    return <div>Error: {error.message}</div>
  }
  if (!data?.distributions) {
    return <div>Dialogue not found</div>
  }

  return (
    <div className={css.layout}>
      <div className={css.navigation}>
        <ul className={css.menu}>
          <li className={css.item}>
            <div className={css.ideas}>
              <Link className={css.link} to={getViewDialoguesRoute()}>
                Назад
              </Link>
              {data!.distributions.map((distributions) => (
                <div className={css.idea} key={distributions.recipient}>
                  <Segment
                    title={
                      <Link className={css.ideaLink} to={getViewDialogueRoute({ Dialogue: distributions.id })}>
                        {distributions.recipient}
                      </Link>
                    }
                    size={2}
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
