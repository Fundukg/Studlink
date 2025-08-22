import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server'
import { trpc } from '../lib/trpc'
// @index('./**/index.ts', f => `import { ${f.path.split('/').slice(0, -1).pop()}TrpcRoute } from '${f.path.split('/').slice(0, -1).join('/')}'`)
import { createDistributionTrpcRoute } from './createDistribution'
import { createStudentTrpcRoute } from './createStudent'
import { getDepartmentTrpcRoute } from './getDepartment'
import { getDialogueTrpcRoute } from './getDialogue'
import { getDialoguesTrpcRoute } from './getDialogues'
import { getFacultyTrpcRoute } from './getFaculty'
import { getGroupTrpcRoute } from './getGroup'
import { getMeTrpcRoute } from './getMe'
import { getStudentTrpcRoute } from './getStudent'
import { signInTrpcRoute } from './signIn'
import { signUpTrpcRoute } from './signUp'
import { updateMessageTrpcRoute } from './updateMessage'
// @endindex
export const trpcRouter = trpc.router({
  // @index('./**/index.ts', f => `${f.path.split('/').slice(0, -1).pop()}: ${f.path.split('/').slice(0, -1).pop()}TrpcRoute,`)
  createDistribution: createDistributionTrpcRoute,
  createStudent: createStudentTrpcRoute,
  getDepartment: getDepartmentTrpcRoute,
  getDialogue: getDialogueTrpcRoute,
  getFaculty: getFacultyTrpcRoute,
  getGroup: getGroupTrpcRoute,
  getMe: getMeTrpcRoute,
  getStudent: getStudentTrpcRoute,
  getDialogues: getDialoguesTrpcRoute,
  signIn: signInTrpcRoute,
  signUp: signUpTrpcRoute,
  updateMessage: updateMessageTrpcRoute,
  // @endindex
})

export type TrpcRouter = typeof trpcRouter
export type TrpcRouterInput = inferRouterInputs<TrpcRouter>
export type TrpcRouterOutput = inferRouterOutputs<TrpcRouter>
