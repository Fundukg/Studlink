import { Link } from 'react-router-dom'
import { getViewDialogueRoute } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import MyImage from './cat.png'
import css from './index.module.scss'
export const NotFoundPage = ({ title = '404', message = 'ОКАК' }: { title?: string; message?: string }) => {
  const { data: recentChats } = trpc.getDialogues.useQuery()
  return (
    <div className={css.app}>
      <div className={css.error}>{title}</div>
      <div className={css.img}>
        <Link to={getViewDialogueRoute({ dialogueId: recentChats!.distributions[0].id })}>
          <img src={MyImage} alt="cat" />
          <h1 className={css.okak}>{message}</h1>
        </Link>
      </div>
    </div>
  )
}
