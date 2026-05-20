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

export const isDeanery = (role: RoleStaff | null | undefined) => {
  return role=== 'DEANERY'
}

export const isTeacher = (role: RoleStaff | null | undefined) => {
  return role === 'TEACHER'
}