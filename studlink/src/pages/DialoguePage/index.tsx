import { useParams } from 'react-router-dom'
import { Segment } from '../../components/Segment'
import type { DialoguesRouteParams } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const DialoguesPage = () => {
  const { Dialogue: workdesk } = useParams() as DialoguesRouteParams

  const { data, error, isLoading, isFetching, isError } = trpc.getDialogues.useQuery({ dialogue: workdesk })

  if (isLoading || isFetching) {
    return <span>Loading...</span>
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }

  if (!data?.Dialogue) {
    return <span>Dialogue not found</span>
  }

  return (
    <Segment title={data.Dialogue.course} description={data.Dialogue.department}>
      <div className={css.text} dangerouslySetInnerHTML={{ __html: data.Dialogue.message }} />
    </Segment>
  )
}
