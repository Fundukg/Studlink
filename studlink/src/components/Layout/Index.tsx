import { Link, Outlet } from 'react-router-dom'
import { getWorkDeskRoute } from '../../lib/routes'

export const Layout = () => {
  return (
    <div>
      <p>
        <b>WorkDesk</b>
      </p>
      <ul>
        <li>
          <Link to={getWorkDeskRoute()}>Work Desk</Link>
        </li>
      </ul>
      <hr />
      <div>
        <Outlet />
      </div>
    </div>
  )
}
