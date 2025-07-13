import z from "zod"
import { Dialogue } from "../../lib/dialogue"
import { trpc } from "../../lib/trpc"

export const getDialoguesTrpcRoute = trpc.procedure
    .input(
      z.object({
        dialogue: z.string(),
      })
    )
    .query(({ input }) => {
      const dialogue = Dialogue.find((dialogue) => dialogue.course === input.dialogue)
      return { Dialogue: dialogue || null }
    })
