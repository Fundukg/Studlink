import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server'
import { trpc } from '../lib/trpc'
// @index('./**/index.ts', f => `import { ${f.path.split('/').slice(0, -1).pop()}TrpcRoute } from '${f.path.split('/').slice(0, -1).join('/')}'`)
import { changePasswordTrpcRoute } from './changePassword'
import { createAdminTrpcRoute } from './createAdmin'
import { createBotTrpcRoute } from './createBot'
import { createDeaneryTrpcRoute } from './createDeanery'
import { createDepartmentTrpcRoute } from './createDepartment'
import { createDirectMessageTrpcRoute } from './createDirectMessage'
import { createDistributionTrpcRoute } from './createDistribution'
import { createFacultyTrpcRoute } from './createFaculty'
import { createGroupTrpcRoute } from './createGroup'
import { createStudentTrpcRoute } from './createStudent'
import { createTeacherTrpcRoute } from './createTeacher'
import { deleteBotTrpcRoute, getBotDeleteStatsTrpcRoute } from './deleteBot'
import { deleteDepartmentTrpcRoute, getDepartmentDeleteStatsTrpcRoute } from './deleteDepartment'
import { deleteFacultyTrpcRoute, getFacultyDeleteStatsTrpcRoute } from './deleteFaculty'
import { deleteGroupTrpcRoute, getGroupDeleteStatsTrpcRoute } from './deleteGroup'
import { deleteStaffTrpcRoute, getStaffDeleteStatsTrpcRoute } from './deleteStaff'
import { deleteStudentTrpcRoute, getStudentDeleteStatsTrpcRoute } from './deleteStudent'
import { getAdminListTrpcRoute } from './getAdminList'
import { getBotsTrpcRoute } from './getBots'
import { getDeaneryListTrpcRoute } from './getDeaneryList'
import { getDepartmentTrpcRoute } from './getDepartment'
import { getDialogueTrpcRoute } from './getDialogue'
import { getDialoguesTrpcRoute } from './getDialogues'
import { getDistributionTrpcRoute } from './getDistribution'
import { getDistributionsTrpcRoute } from './getDistributions'
import { getFacultyTrpcRoute } from './getFaculty'
import { getGroupTrpcRoute } from './getGroup'
import { getMeTrpcRoute } from './getMe'
import { getOneStudentTrpcRoute } from './getOneStudent'
import { getStructureTrpcRoute } from './getStructure'
import { getStudentTrpcRoute } from './getStudent'
import { getTeacherListTrpcRoute } from './getTeacherList'
import { signInTrpcRoute } from './signIn'
import { updateAdminTrpcRoute } from './updateAdmin'
import { updateBotTrpcRoute } from './updateBot'
import { updateDeaneryTrpcRoute } from './updateDeanery'
import { updateDepartmentTrpcRoute } from './updateDepartment'
import { updateFacultyTrpcRoute } from './updateFaculty'
import { updateGroupTrpcRoute } from './updateGroup'
// import { updateMessageTrpcRoute } from './updateMessage'
import { updateMyProfileTrpcRoute } from './updateMyProfile'
import { updateStudentTrpcRoute } from './updateStudent'
import { updateTeacherTrpcRoute } from './updateTeacher'
// @endindex
export const trpcRouter = trpc.router({
  // @index('./**/index.ts', f => `${f.path.split('/').slice(0, -1).pop()}: ${f.path.split('/').slice(0, -1).pop()}TrpcRoute,`)
  changePassword: changePasswordTrpcRoute,
  createAdmin: createAdminTrpcRoute,
  createBot: createBotTrpcRoute,
  createDeanery: createDeaneryTrpcRoute,
  createDepartment: createDepartmentTrpcRoute,
  createDirectMessage: createDirectMessageTrpcRoute,
  createDistribution: createDistributionTrpcRoute,
  createFaculty: createFacultyTrpcRoute,
  createGroup: createGroupTrpcRoute,
  createStudent: createStudentTrpcRoute,
  createTeacher: createTeacherTrpcRoute,
  deleteBot: deleteBotTrpcRoute,
  deleteDepartment: deleteDepartmentTrpcRoute,
  deleteFaculty: deleteFacultyTrpcRoute,
  deleteGroup: deleteGroupTrpcRoute,
  deleteStaff: deleteStaffTrpcRoute,
  deleteStudent: deleteStudentTrpcRoute,
  getAdminList: getAdminListTrpcRoute,
  getBots: getBotsTrpcRoute,
  getDeaneryList: getDeaneryListTrpcRoute,
  getDepartment: getDepartmentTrpcRoute,
  getDialogue: getDialogueTrpcRoute,
  getDialogues: getDialoguesTrpcRoute,
  getDistribution: getDistributionTrpcRoute,
  getDistributions: getDistributionsTrpcRoute,
  getFaculty: getFacultyTrpcRoute,
  getGroup: getGroupTrpcRoute,
  getMe: getMeTrpcRoute,
  getOneStudent: getOneStudentTrpcRoute,
  getStructure: getStructureTrpcRoute,
  getStudent: getStudentTrpcRoute,
  getTeacherList: getTeacherListTrpcRoute,
  signIn: signInTrpcRoute,
  updateAdmin: updateAdminTrpcRoute,
  updateBot: updateBotTrpcRoute,
  updateDeanery: updateDeaneryTrpcRoute,
  updateDepartment: updateDepartmentTrpcRoute,
  updateFaculty: updateFacultyTrpcRoute,
  updateGroup: updateGroupTrpcRoute,
  // updateMessage: updateMessageTrpcRoute,
  updateMyProfile: updateMyProfileTrpcRoute,
  updateStudent: updateStudentTrpcRoute,
  updateTeacher: updateTeacherTrpcRoute,
  // @endindex
  getStudentDeleteStats: getStudentDeleteStatsTrpcRoute,
  getFacultyDeleteStats: getFacultyDeleteStatsTrpcRoute,
  getDepartmentDeleteStats: getDepartmentDeleteStatsTrpcRoute,
  getGroupDeleteStats: getGroupDeleteStatsTrpcRoute,
  getBotDeleteStats: getBotDeleteStatsTrpcRoute,
  getDeaneryDeleteStats: getStaffDeleteStatsTrpcRoute,
})

export type TrpcRouter = typeof trpcRouter
export type TrpcRouterInput = inferRouterInputs<TrpcRouter>
export type TrpcRouterOutput = inferRouterOutputs<TrpcRouter>
