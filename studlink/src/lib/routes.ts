const getRouteParams = <T extends Record<string, boolean>>(object: T) => {
  return Object.keys(object).reduce((acc, key) => ({ ...acc, [key]: `:${key}` }), {}) as Record<keyof T, string>
}

export const getWorkDeskRoute = () => '/'

export const dialoguesRouteParams = getRouteParams({ workdesk: true })
export type DialoguesRouteParams = typeof dialoguesRouteParams
export const getDialoguesRoute = ({ workdesk }: DialoguesRouteParams) => `/dialogue/${workdesk}`

// export const DialoguesRouteParams = { workdesk: ':WorkDesk' }
// export type DialoguesRouteParams =  { workdesk: string }
// export const getDialoguesRoute = ({ workdesk }: { workdesk: string }) => `/dialogue/${workdesk}`
