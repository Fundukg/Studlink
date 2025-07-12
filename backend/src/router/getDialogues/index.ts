import z from "zod"
import { WorkDesk } from "../../lib/dialogue"
import { trpc } from "../../lib/trpc"

export const getDialoguesTrpcRoute = trpc.procedure
    .input(
      z.object({
        workdesk: z.string(),
      })
    )
    .query(({ input }) => {
      const workdesk = WorkDesk.find((WorkDesk) => WorkDesk.nick === input.workdesk)
      return { WorkDesk: workdesk || null }
    })
