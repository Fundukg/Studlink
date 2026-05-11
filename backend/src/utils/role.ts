import { RoleStaff } from '@prisma/client' // Если типы общие, или просто строку

export const getStaffPermissions = (role: RoleStaff | null | undefined) => {
  return {
    isAdmin: role === 'ADMIN',
    isDeanery: role === 'DEANERY',
    isTeacher: role === 'TEACHER',
    isAtLeastDeanery: role === 'ADMIN' || role === 'DEANERY',
  }
}

export const isAdmin = (role: RoleStaff | null | undefined) => {
  return role === 'ADMIN'
}

export const isDeanery = (ctx: { me: { role: RoleStaff } }) => {
  return ctx.me.role === 'DEANERY'
}

export const isTeacher = (ctx: { me: { role: RoleStaff } }) => {
  return ctx.me.role === 'TEACHER'
}