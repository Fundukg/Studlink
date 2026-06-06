const getRouteParams = <T extends Record<string, boolean>>(object: T) => {
  return Object.keys(object).reduce((acc, key) => ({ ...acc, [key]: `:${key}` }), {}) as Record<keyof T, string>
}

export const getStartRoute = () => '/'

export  const getViewDistributionsRoute = () => '/distributions'

export const viewdialogueRouteParams = getRouteParams({ dialogueId: true })
export type ViewDialogueRouteParams = typeof viewdialogueRouteParams
export const getViewDialogueRoute = ({ dialogueId }: ViewDialogueRouteParams) => `/dialogue/${dialogueId}`

export const viewdistributionRouteParams = getRouteParams({ distributionId: true })
export type ViewDistributionRouteParams = typeof viewdistributionRouteParams
export const getViewDistributionRoute = ({ distributionId }: ViewDistributionRouteParams) => `/distribution/${distributionId}`

export const editMessageRouteParams = getRouteParams({ dialogueId: true })
export type EditMessageRouteParams = typeof editMessageRouteParams
export const getEditMessageRoute = ({ dialogueId }: EditMessageRouteParams) => `/dialogue/${dialogueId}/edit`

export const getNewDistributionRoute = () => '/distribution/new'

export const getSignUpRoute = () => '/sign-up'

export const getSignInRoute = () => '/sign-in'

export const getSignOutRoute = () => '/sign-out'

export const getViewStudentRoute = () => '/students' 

export const getViewFacultyRoute = () => '/facultys' 

export const getViewDepartmentRoute = () => '/departments'

export const getViewGroupRoute = () => '/groups'

export const getViewBotRoute = () => '/bots'

export const getViewDeaneryRoute = () => '/deanerys'

export const getViewAdminRoute = () => '/admins'

export const getViewTeacherRoute = () => '/teachers'

export const importStudentsRoute = () => '/import-students'

export const getProfileSetupRoute = () => '/profile-setup'

export const getProfileRoute = () => '/profile'


// export const DialoguesRouteParams = { workdesk: ':WorkDesk' }
// export type DialoguesRouteParams =  { workdesk: string }
// export const getDialoguesRoute = ({ workdesk }: { workdesk: string }) => `/dialogue/${workdesk}`
