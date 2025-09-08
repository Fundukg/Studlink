import { zCreateDistributionTrpcInput } from '@parkstick/backend/src/router/createDistribution/input'
import { format } from 'date-fns/format'
import { useParams } from 'react-router-dom'
import { Alert } from '../../components/Alert'
import { ButtonSend } from '../../components/Button'
import { Segment } from '../../components/Segment'
import { Textarea } from '../../components/Textarea'
import { useForm } from '../../lib/form'
import { withPageWrapper } from '../../lib/pageWarpper'
import { type ViewDialogueRouteParams } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const ViewDialoguePage = withPageWrapper({
  authorizedOnly: true,
  useQuery: () => {
    const { dialogueId } = useParams() as ViewDialogueRouteParams
    return trpc.getDialogue.useQuery({
      distributionId: dialogueId,
    })
  },
  setProps: ({ queryResult, ctx, checkExists }) => ({
    dialogue: checkExists(queryResult.data.dialogue, 'Dialogue not found'),
    me: ctx.me,
  }),
})(({ dialogue }) => {
  const createDistribution = trpc.createDistribution.useMutation()
  const { dialogueId } = useParams() as ViewDialogueRouteParams
  const trpcUtils = trpc.useContext()

  const { formik, buttonProps, alertProps } = useForm({
    initialValues: {
      targetType: 'STUDENT' as const,
      targetId: dialogue.recipient.id,
      text: '',
    },
    validationSchema: zCreateDistributionTrpcInput,

    onSubmit: async (values) => {
      await createDistribution.mutateAsync(values)

      // Обновляем данные диалога после отправки сообщения
      await trpcUtils.getDialogue.invalidate({ distributionId: dialogueId })
      formik.resetForm()
    },
    successMessage: 'Сообщение отправлено',
    showValidationAlert: true,
  })

  return (
    <div className={css.dialogue}>
      <Segment title={dialogue.recipient.name} size={1}>
        <div className={css.createdAt}>Все сообщения диалога</div>

        {/* Отображаем все сообщения диалога */}
        <div className={css.messages}>
          {dialogue.messages.map((message) => (
            <div
              key={message.id}
              className={`${css.message} ${message.isDistribution ? css.distribution : ''} ${message.sender.type === 'STAFF' ? css.staffMessage : css.studentMessage}`}
            >
              <div className={css.messageHeader}>
                <span className={css.senderName}>
                  {message.sender.name}
                  {message.sender.type === 'STUDENT' && ` (${message.sender.studentId})`}
                </span>
                <span className={css.senderType}>({message.sender.type === 'STAFF' ? 'Сотрудник' : 'Студент'})</span>
                <span className={css.messageDate}>{format(message.createdAt, 'yyyy-MM-dd HH:mm')}</span>
              </div>
              <div className={css.messageText} dangerouslySetInnerHTML={{ __html: message.text }} />
            </div>
          ))}
        </div>
        <form onSubmit={formik.handleSubmit}>
          <Textarea name="text" label="Сообщение" formik={formik} />
          <Alert {...alertProps} />
          <ButtonSend {...buttonProps}>Отправить</ButtonSend>
        </form>
      </Segment>
    </div>
  )
})
