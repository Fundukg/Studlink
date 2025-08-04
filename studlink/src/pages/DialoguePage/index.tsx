import { format } from 'date-fns/format'
import { useParams } from 'react-router-dom'
import { ButtomLink } from '../../components/Button'
import { Segment } from '../../components/Segment'
import { getEditMessageRoute, type ViewDialoguesRouteParams } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const DialoguesPage = () => {
  const { Dialogue: workdesk } = useParams() as ViewDialoguesRouteParams

   const getDialogueResult = trpc.getDialogues.useQuery({ 
    dialogue: workdesk 
  })
  const getMeResult = trpc.getMe.useQuery()

  if (getDialogueResult.isLoading || getDialogueResult.isFetching || getMeResult.isLoading || getMeResult.isFetching) {
    return <span>Loading...</span>
  }

  if (getDialogueResult.isError) {
    return <span>Error: {getDialogueResult.error.message}</span>
  }

  if (getMeResult.isError) {
    return <span>Error: {getMeResult.error.message}</span>
  }

  if (!getDialogueResult.data!.Dialogue) {
    return <span>Idea not found</span>
  }

  const dialogue = getDialogueResult.data!.Dialogue
  const me = getMeResult.data!.me

  return (
    <div className={css.dialogue}>
      <Segment title={dialogue.course} size={1} description={dialogue.department}>
        <div className={css.createdAt}>Дата отправки: {format(dialogue.createdAt, 'yyyy-MM-dd')} </div>
        <div className={css.author}>От: {dialogue.author.nick}</div>
        <div className={css.text} dangerouslySetInnerHTML={{ __html: dialogue.message }} />
      </Segment>
      
      {me?.id === dialogue.authorId &&(
        <div className={css.editButton}>
          <ButtomLink to={getEditMessageRoute({ dialogueId: dialogue.group})} >Редактировать</ButtomLink> 
          
        </div>
      )}
    </div>
  )
}
