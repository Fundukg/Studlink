import type { TrpcRouterOutput } from '@parkstick/backend/src/router'
import { zUpdateMessageTrpcInput } from '@parkstick/backend/src/router/updateMessage/input'
import { useFormik } from 'formik'
import { withZodSchema } from 'formik-validator-zod'
import pick from 'lodash/pick'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert } from '../../components/Alert'
import { ButtonSend } from '../../components/Button'
import { FormItems } from '../../components/FormItems'
import { Input } from '../../components/Input'
import { Segment } from '../../components/Segment'
import { Textarea } from '../../components/Textarea'
import { type EditMessageRouteParams, getViewDialoguesRoute } from '../../lib/routes'
import { trpc } from '../../lib/trpc'

const EditMessageComponent = ({ Dialogue }: { Dialogue: NonNullable<TrpcRouterOutput['getDialogues']['Dialogue']> }) => {
  const navigate = useNavigate()
  const [submittingError, setSubmittingError] = useState<string | null>(null)
  const updateMessage = trpc.updateMessage.useMutation()
  const formik = useFormik({
    initialValues: pick(Dialogue, ['course','group', 'directions', 'department', 'message']),
    validate: withZodSchema(zUpdateMessageTrpcInput.omit({ dialogueId: true })),
    onSubmit: async (values) => {
      try {
        setSubmittingError(null)
        await updateMessage.mutateAsync({ dialogueId: Dialogue.id, ...values })
        navigate(getViewDialoguesRoute({ Dialogue: values.group }))
      } catch (err: any) {
        setSubmittingError(err.message)
      }
    },
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
          {!formik.isValid && !!formik.submitCount && <Alert color="red">Some fields are invalid</Alert>}
          {submittingError && <Alert color="red">{submittingError}</Alert>}
          <ButtonSend loading={formik.isSubmitting}>Update Idea</ButtonSend>
        </FormItems>
      </form>
    </Segment>
  )
}

export const EditMessagePage = () => {
  const { dialogueId } = useParams() as EditMessageRouteParams

  const getDialogueResult = trpc.getDialogues.useQuery({ 
    dialogue: dialogueId 
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

  if (!me) {
    return <span>Only for authorized</span>
  }

  if (me.id !== dialogue.authorId) {
    return <span>An dialogue can only be edited by the author</span>
  }

  return <EditMessageComponent Dialogue={dialogue} />
}
