export const isAdmin = (role?: string) => role === 'ADMIN';
export const isDeanery = (role?: string) => role === 'DEANERY';
export const isTeacher = (role?: string) => role === 'TEACHER';

// Комбинированные проверки, если нужно
export const isStaff = (role?: string) => 
  isAdmin(role) || isDeanery(role) || isTeacher(role);