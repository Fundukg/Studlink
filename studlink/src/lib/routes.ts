const getRouteParams = <T extends Record<string, boolean>>(object: T) => {
  return Object.keys(object).reduce((acc, key) => ({ ...acc, [key]: `:${key}` }), {}) as Record<keyof T, string>
}

export const getViewDialoguesRoute = () => '/'

export  const getViewDistributionsRoute = () => '/Distributions'

export const viewdialogueRouteParams = getRouteParams({ dialogueId: true })
export type ViewDialogueRouteParams = typeof viewdialogueRouteParams
export const getViewDialogueRoute = ({ dialogueId }: ViewDialogueRouteParams) => `/dialogue/${dialogueId}`

export const viewdistributionRouteParams = getRouteParams({ distributionId: true })
export type ViewDistributionRouteParams = typeof viewdistributionRouteParams
export const getViewDistributionRoute = ({ distributionId }: ViewDistributionRouteParams) => `/distribution/${distributionId}`

export const editMessageRouteParams = getRouteParams({ dialogueId: true })
export type EditMessageRouteParams = typeof editMessageRouteParams
export const getEditMessageRoute = ({ dialogueId }: EditMessageRouteParams) => `/dialogue/${dialogueId}/edit`

export const getNewDistributionRoute = () => 'dialogue/new'

export const getSignUpRoute = () => '/sign-up'

export const getSignInRoute = () => '/sign-in'

export const getSignOutRoute = () => '/sign-out'

export const getNewStudentRoute = () => '/student/new'

export const getViewStudentRoute = () => '/student' 
// export const DialoguesRouteParams = { workdesk: ':WorkDesk' }
// export type DialoguesRouteParams =  { workdesk: string }
// export const getDialoguesRoute = ({ workdesk }: { workdesk: string }) => `/dialogue/${workdesk}`
