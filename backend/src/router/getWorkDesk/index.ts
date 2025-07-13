import _ from "lodash"
import { Dialogue } from "../../lib/dialogue"
import { trpc } from "../../lib/trpc"


export const getWorkDeskTrpcRoute = trpc.procedure.query(() => {
    return { dialogue: Dialogue.map((dialogue) => _.pick(dialogue, ['course', 'departament', 'directions', 'group', 'message'])) }
  })
