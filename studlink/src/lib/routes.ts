const getRouteParams = <T extends Record<string, boolean>>(object: T) => {
  return Object.keys(object).reduce((acc, key) => ({ ...acc, [key]: `:${key}` }), {}) as Record<keyof T, string>
}

export const getWorkDeskRoute = () => '/'

export const dialoguesRouteParams = getRouteParams({ Dialogue: true })
export type DialoguesRouteParams = typeof dialoguesRouteParams
export const getDialoguesRoute = ({ Dialogue }: DialoguesRouteParams) => `/dialogue/${Dialogue}`

export const getNewDistributionRoute = () => 'dialogue/new'

export const getSignUpRoute = () => '/sign-up'

export const getSignInRoute = () => '/sign-in'

export const getSignOutRoute = () => '/sign-out'
// export const DialoguesRouteParams = { workdesk: ':WorkDesk' }
// export type DialoguesRouteParams =  { workdesk: string }
// export const getDialoguesRoute = ({ workdesk }: { workdesk: string }) => `/dialogue/${workdesk}`
