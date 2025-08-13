import { Link } from 'react-router-dom'
import { getWorkDeskRoute } from '../../lib/routes'
import MyImage from './cat.png'
import css from './index.module.scss'
export const NotFoundPage = ({ title = '404', message = 'ОКАК' }: { title?: string; message?: string }) => {
  return (
    <div className={css.app}>
      <div className={css.error}>{title}</div>
      <div className={css.img}>
        <Link to={getWorkDeskRoute()}>
          <img src={MyImage} alt="cat" />
          <h1 className={css.okak}>{message}</h1>
        </Link>
      </div>
    </div>
  )
}
