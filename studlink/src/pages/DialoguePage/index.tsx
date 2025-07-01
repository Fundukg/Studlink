import { useParams } from 'react-router-dom'
import type { DialoguesRouteParams } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const DialoguesPage = () => {
  const { workdesk } = useParams() as DialoguesRouteParams

  const { data, error, isLoading, isFetching, isError } = trpc.getDialogues.useQuery({ workdesk })

  if (isLoading || isFetching) {
    return <span>Loading...</span>
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }

  if (!data?.WorkDesk) {
    return <span>Dialogue not found</span>
  }

  return (
    <div>
      <h1 className={css.title}>{data.WorkDesk.name}</h1>
      <p className={css.description}>{data.WorkDesk.description}</p>
      <div className={css.text} dangerouslySetInnerHTML={{ __html: data.WorkDesk.text }} />
    </div>
  )
}
