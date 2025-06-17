import { trpc } from '../../lib/trpc'

type WorkDeskItem = {
  nick: string
  name: string
  description: string
}

export const WorkDesk = () => {
  const { data, error, isLoading, isFetching, isError } = trpc.getWorkDesk.useQuery()

  if (isLoading || isFetching) {
    return <span>Loading...</span>
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }

  return (
    <div>
      <h1>StudLink</h1>
      {data.WorkDesk.map((WorkDeskList: WorkDeskItem) => {
        return (
          <div key={WorkDeskList.nick}>
            <h2>{WorkDeskList.name}</h2>
            <p>{WorkDeskList.description}</p>
          </div>
        )
      })}
    </div>
  )
}
