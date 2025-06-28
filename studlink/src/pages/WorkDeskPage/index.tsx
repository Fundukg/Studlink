import { Link } from 'react-router-dom'
import { getDialoguesRoute } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
           




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
      <h1>StudLink</h1>
      {data!.WorkDesk.map((WorkDeskList) => {
        return (
          <div key={WorkDeskList.nick}>
            <h2>
              <Link to={getDialoguesRoute({ workdesk: WorkDeskList.nick })}>{WorkDeskList.name}</Link>
            </h2>
            <p>{WorkDeskList.description}</p>
          </div>
        )
      })}
    </div>
  )
}
