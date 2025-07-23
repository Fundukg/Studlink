import { format } from 'date-fns/format'
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
    <div className={css.dialogue}>
      <Segment title={data.Dialogue.course} description={data.Dialogue.department}>
        <div className={css.createdAt}>Дата отправки: {format(data.Dialogue.createdAt, 'yyyy-MM-dd')} </div>
        <div className={css.text} dangerouslySetInnerHTML={{ __html: data.Dialogue.message }} />
      </Segment>
    </div>
  )
}
