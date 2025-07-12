import _ from "lodash"
import { WorkDesk } from "../../lib/dialogue"
import { trpc } from "../../lib/trpc"


export const getWorkDeskTrpcRoute = trpc.procedure.query(() => {
    return { WorkDesk: WorkDesk.map((WorkDesk) => _.pick(WorkDesk, ['nick', 'name', 'description'])) }
  })
