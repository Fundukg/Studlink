import { zUpdateMessageTrpcInput } from '@parkstick/backend/src/router/updateMessage/input'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert } from '../../components/Alert'
import { ButtonSend } from '../../components/Button'
import { FormItems } from '../../components/FormItems'
import { ReadOnlyField } from '../../components/Input'
import { Segment } from '../../components/Segment'
import { Textarea } from '../../components/Textarea'
import { useForm } from '../../lib/form'
import { withPageWrapper } from '../../lib/pageWarpper'
import { type EditMessageRouteParams, getViewDialogueRoute } from '../../lib/routes'
import { trpc } from '../../lib/trpc'

export const EditMessagePage = withPageWrapper({
  authorizedOnly: true,
  useQuery: () => {
    const { dialogueId } = useParams() as EditMessageRouteParams
    return trpc.getDialogue.useQuery({
      studentId: dialogueId,
    })
  },
  setProps: ({ queryResult, ctx, checkExists, checkAccess }) => {
    const dialogue = checkExists(queryResult.data.dialogue, 'Dialogue not found')
    checkAccess(ctx.me?.id === dialogue.messages[0].sender.id, 'An dialogue can only be edited by the author')
    return { dialogue }
  },
})(({ dialogue }) => {
  const navigate = useNavigate()
  const updateMessage = trpc.updateMessage.useMutation()
  const initialValues = {
    text: dialogue.messages[0].text || '', // Гарантируем, что text будет строкой
  }
  const { formik, buttonProps, alertProps } = useForm({
    initialValues,
    validationSchema: zUpdateMessageTrpcInput.omit({ dialogueId: true }),
    onSubmit: async (values) => {
      await updateMessage.mutateAsync({ dialogueId: dialogue.recipient.id, ...values })
      navigate(getViewDialogueRoute({ dialogueId: dialogue.recipient.id }))
    },
    resetOnSuccess: false,
    showValidationAlert: true,
  })

  return (
    <Segment title={`Редактирование сообщения: ${dialogue.recipient.name}`}>
      <form onSubmit={formik.handleSubmit}>
        <FormItems>
          <ReadOnlyField label="Получатель" value={dialogue.recipient.name} />
          <Textarea label="Сообщение" name="text" formik={formik} />
          <Alert {...alertProps} />
          <ButtonSend {...buttonProps}>Изменить</ButtonSend>
        </FormItems>
      </form>
    </Segment>
  )
})
