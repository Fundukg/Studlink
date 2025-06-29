import { useParams } from 'react-router-dom'
import type { DialoguesRouteParams } from '../../lib/routes'
import { trpc } from '../../lib/trpc'

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
      <h1>{data.WorkDesk.name}</h1>
      <p>{data.WorkDesk.description}</p>
      <div dangerouslySetInnerHTML={{ __html: data.WorkDesk.text }}></div>
    </div>
  )
}
