import { useParams } from 'react-router-dom'
import type { DialoguesRouteParams } from '../../lib/routes'

export const DialoguesPage = () => {
  const { workdesk } = useParams() as DialoguesRouteParams
  return (
    <div>
      <h1>{workdesk}</h1>
      <div>
        <p>Dialogue 1 ...</p>
        <p>Dialogue 2 ...</p>
        <p>Dialogue 3 ...</p>
      </div>
    </div>
  )
}
