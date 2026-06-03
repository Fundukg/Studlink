import { UserRole } from '@prisma/client' // Если типы общие, или просто строку

export const getStaffPermissions = (role: UserRole | null | undefined) => {
  return {
    isAdmin: role === 'ADMIN',
    isDeanery: role === 'DEANERY',
    isTeacher: role === 'TEACHER',
    isAtLeastDeanery: role === 'ADMIN' || role === 'DEANERY',
  }
}

export const isAdmin = (role: UserRole | null | undefined) => {
  return role === 'ADMIN'
}

export const isDeanery = (role: UserRole | null | undefined) => {
  return role=== 'DEANERY'
}

export const isTeacher = (role: UserRole | null | undefined) => {
  return role === 'TEACHER'
}

export const isStudent = (role: UserRole | null | undefined) => {
  return role === 'STUDENT' 
}