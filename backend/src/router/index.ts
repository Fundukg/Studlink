import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server'
import { trpc } from '../lib/trpc'
// @index('./**/index.ts', f => `import { ${f.path.split('/').slice(0, -1).pop()}TrpcRoute } from '${f.path.split('/').slice(0, -1).join('/')}'`)
import { createBotTrpcRoute } from './createBot'
import { createDepartmentTrpcRoute } from './createDepartment'
import { createDirectMessageTrpcRoute } from './createDirectMessage'
import { createDistributionTrpcRoute } from './createDistribution'
import { createFacultyTrpcRoute } from './createFaculty'
import { createGroupTrpcRoute } from './createGroup'
import { createStudentTrpcRoute } from './createStudent'
import { deleteBotTrpcRoute, getBotDeleteStatsTrpcRoute } from './deleteBot'
import { deleteDepartmentTrpcRoute, getDepartmentDeleteStatsTrpcRoute } from './deleteDepartment'
import { deleteFacultyTrpcRoute, getFacultyDeleteStatsTrpcRoute } from './deleteFaculty'
import { deleteGroupTrpcRoute, getGroupDeleteStatsTrpcRoute } from './deleteGroup'
import { deleteStaffTrpcRoute, getStaffDeleteStatsTrpcRoute } from './deleteStaff'
import { deleteStudentTrpcRoute, getStudentDeleteStats } from './deleteStudent'
import { getBotsTrpcRoute } from './getBots'
import { getDepartmentTrpcRoute } from './getDepartment'
import { getDialogueTrpcRoute } from './getDialogue'
import { getDialoguesTrpcRoute } from './getDialogues'
import { getDistributionTrpcRoute } from './getDistribution'
import { getDistributionsTrpcRoute } from './getDistributions'
import { getFacultyTrpcRoute } from './getFaculty'
import { getGroupTrpcRoute } from './getGroup'
import { getMeTrpcRoute } from './getMe'
import { getOneStudentTrpcRoute } from './getOneStudent'
import { getStaffTrpcRoute } from './getStaff'
import { getStructureTrpcRoute } from './getStructure'
import { getStudentTrpcRoute } from './getStudent'
import { signInTrpcRoute } from './signIn'
import { signUpTrpcRoute } from './signUp'
import { updateBotTrpcRoute } from './updateBot'
import { updateDepartmentTrpcRoute } from './updateDepartment'
import { updateFacultyTrpcRoute } from './updateFaculty'
import { updateGroupTrpcRoute } from './updateGroup'
import { updateMessageTrpcRoute } from './updateMessage'
import { updateStaffTrpcRoute } from './updateStaff'
import { updateStudentTrpcRoute } from './updateStudent'
// @endindex
export const trpcRouter = trpc.router({
  // @index('./**/index.ts', f => `${f.path.split('/').slice(0, -1).pop()}: ${f.path.split('/').slice(0, -1).pop()}TrpcRoute,`)
  createBot: createBotTrpcRoute,
  createDepartment: createDepartmentTrpcRoute,
  createDirectMessage: createDirectMessageTrpcRoute,
  createDistribution: createDistributionTrpcRoute,
  createFaculty: createFacultyTrpcRoute,
  createGroup: createGroupTrpcRoute,
  createStudent: createStudentTrpcRoute,
  deleteBot: deleteBotTrpcRoute,
  deleteDepartment: deleteDepartmentTrpcRoute,
  deleteFaculty: deleteFacultyTrpcRoute,
  deleteGroup: deleteGroupTrpcRoute,
  deleteStaff: deleteStaffTrpcRoute,
  deleteStudent: deleteStudentTrpcRoute,
  getBots: getBotsTrpcRoute,
  getDepartment: getDepartmentTrpcRoute,
  getDialogue: getDialogueTrpcRoute,
  getDialogues: getDialoguesTrpcRoute,
  getDistribution: getDistributionTrpcRoute,
  getDistributions: getDistributionsTrpcRoute,
  getFaculty: getFacultyTrpcRoute,
  getGroup: getGroupTrpcRoute,
  getMe: getMeTrpcRoute,
  getOneStudent: getOneStudentTrpcRoute,
  getStaff: getStaffTrpcRoute,
  getStructure: getStructureTrpcRoute,
  getStudent: getStudentTrpcRoute,
  signIn: signInTrpcRoute,
  signUp: signUpTrpcRoute,
  updateBot: updateBotTrpcRoute,
  updateDepartment: updateDepartmentTrpcRoute,
  updateFaculty: updateFacultyTrpcRoute,
  updateGroup: updateGroupTrpcRoute,
  updateMessage: updateMessageTrpcRoute,
  updateStaff: updateStaffTrpcRoute,
  updateStudent: updateStudentTrpcRoute,
  // @endindex
  getStudentDeleteStats: getStudentDeleteStats,
  getFacultyDeleteStats: getFacultyDeleteStatsTrpcRoute,
  getDepartmentDeleteStats: getDepartmentDeleteStatsTrpcRoute,
  getGroupDeleteStats: getGroupDeleteStatsTrpcRoute,
  getBotDeleteStats: getBotDeleteStatsTrpcRoute,
  getStaffDeleteStats: getStaffDeleteStatsTrpcRoute
})

export type TrpcRouter = typeof trpcRouter
export type TrpcRouterInput = inferRouterInputs<TrpcRouter>
export type TrpcRouterOutput = inferRouterOutputs<TrpcRouter>
