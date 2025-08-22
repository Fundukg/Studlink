import { z } from 'zod'

export const zUpdateMessageTrpcInput = z.object({
  dialogueId: z.string().uuid(),
  text: z.string().min(1, "Текст сообщения обязателен"),
})
