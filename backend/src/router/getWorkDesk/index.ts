import _ from "lodash"
import { Dialogue } from "../../lib/dialogue"
import { trpc } from "../../lib/trpc"


export const getWorkDeskTrpcRoute = trpc.procedure.query(() => {
    return { Dialogue: Dialogue.map((dialogue) => _.pick(dialogue, ['course', 'department', 'directions', 'group', 'message'])) }
  })
