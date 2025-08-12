import { zUpdateMessageTrpcInput } from '@parkstick/backend/src/router/updateMessage/input'
import pick from 'lodash/pick'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert } from '../../components/Alert'
import { ButtonSend } from '../../components/Button'
import { FormItems } from '../../components/FormItems'
import { Input } from '../../components/Input'
import { Segment } from '../../components/Segment'
import { Textarea } from '../../components/Textarea'
import { useForm } from '../../lib/form'
import { withPageWrapper } from '../../lib/pageWarpper'
import { type EditMessageRouteParams, getViewDialoguesRoute } from '../../lib/routes'
import { trpc } from '../../lib/trpc'

export const EditMessagePage = withPageWrapper({
  authorizedOnly: true,
  useQuery: () => {
    const { dialogueId } = useParams() as EditMessageRouteParams
    return trpc.getDialogues.useQuery({
      dialogue: dialogueId,
    })
  },
  setProps: ({ queryResult, ctx, checkExists, checkAccess  }) => {
    const Dialogue = checkExists(queryResult.data.Dialogue, 'Dialogue not found')
    checkAccess(ctx.me?.id === Dialogue.authorId, 'An dialogue can only be edited by the author')
      return { Dialogue }
  },
})(({ Dialogue }) => {
  const navigate = useNavigate()
  const updateMessage = trpc.updateMessage.useMutation()
  const { formik, buttonProps, alertProps } = useForm({
    initialValues: pick(Dialogue, ['course', 'group', 'directions', 'department', 'message']),
    validationSchema: zUpdateMessageTrpcInput.omit({ dialogueId: true }),
    onSubmit: async (values) => {
      await updateMessage.mutateAsync({ dialogueId: Dialogue.id, ...values })
      navigate(getViewDialoguesRoute({ Dialogue: values.group }))
    },
    resetOnSuccess: false,
    showValidationAlert: true,
  })

  return (
    <Segment title={`Edit Idea: ${Dialogue.group}`}>
      <form onSubmit={formik.handleSubmit}>
        <FormItems>
          <Input label="Сourse" name="course" formik={formik} />
          <Input label="Group" name="group" formik={formik} />
          <Input label="Directions" name="directions" maxWidth={500} formik={formik} />
          <Input label="Department" name="department" maxWidth={500} formik={formik} />
          <Textarea label="Message" name="message" formik={formik} />
          <Alert {...alertProps} />
          <ButtonSend {...buttonProps}>Изменить</ButtonSend>
        </FormItems>
      </form>
    </Segment>
  )
})
