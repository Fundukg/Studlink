const getRouteParams = <T extends Record<string, boolean>>(object: T) => {
  return Object.keys(object).reduce((acc, key) => ({ ...acc, [key]: `:${key}` }), {}) as Record<keyof T, string>
}

export const getViewDialoguesRoute = () => '/'

export const viewdialogueRouteParams = getRouteParams({ Dialogue: true })
export type ViewDialogueRouteParams = typeof viewdialogueRouteParams
export const getViewDialogueRoute = ({ Dialogue }: ViewDialogueRouteParams) => `/dialogue/${Dialogue}`

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
