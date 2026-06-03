// backend/src/middleware/auth.ts
import { UserRole } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { trpc } from '../lib/trpc' // Путь к твоему корневому инстансу tRPC

// 1. Все типы разрешений системы StudLink
export type Permission =
  // Управление студентами и профилями
  | 'view:students'
  | 'manage:students' // Создание, изменение, импорт из Excel
  // Управление персоналом и ролями
  | 'view:staff'
  | 'manage:staff' // Изменение ролей, паролей сотрудников
  // Управление учебной структурой
  | 'manage:structure' // Факультеты, кафедры, группы
  // Коммуникации и рассылки
  | 'view:messages' // Чтение истории диалогов
  | 'send:direct-message' // Ответ конкретному студенту от лица куратора
  | 'create:distribution' // Создание массовых рассылок (Таргет: COURSE, ALL, FACULTY)
  | 'create:group-distribution' // Ограниченная рассылка только своим группам (для TEACHER)
  // Системные настройки
  | 'manage:bots' // Включение/выключение ботов, изменение токенов
  | 'view:logs' // Просмотр логов автоматизации парсера / крона

// 2. Финальная матрица доступов StudLink на основе твоего UserRole
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    'view:students',
    'manage:students',
    'view:staff',
    'manage:staff',
    'manage:structure',
    'view:messages',
    'send:direct-message',
    'create:distribution',
    'create:group-distribution',
    'manage:bots',
    'view:logs',
  ],
  [UserRole.DEANERY]: [
    'view:students',
    'manage:students',
    'view:staff', // Видеть коллег из деканата можно
    'manage:structure', // Могут менять структуру групп/кафедр своего факультета
    'view:messages',
    'send:direct-message',
    'create:distribution', // Полноценные рассылки на факультеты/курсы
    'create:group-distribution',
  ],
  [UserRole.TEACHER]: [
    'view:students', // Преподаватель видит студентов
    'view:messages', // Видит только свои диалоги со студентами
    'send:direct-message', // Может ответить студенту
    'create:group-distribution', // Вещает только на группы, где ведет пары
    'create:distribution',
  ],
  [UserRole.STUDENT]: [
    'view:messages', // Студент видит только свою историю сообщений через API/Бот
    'send:direct-message', // Может писать в боте
  ],
}

// 3. Базовые сущности tRPC
export const publicProcedure = trpc.procedure
export const middleware = trpc.middleware
export const router = trpc.router

// 4. МИДЛВАРЫ (Middlewares)

// Проверка базовой авторизации (проверяет ctx.me, сформированный Passport-jwt)
export const isAuthenticated = middleware(async ({ ctx, next }) => {
  if (!ctx.me) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Вы не авторизованы',
    })
  }
  return next({
    ctx: { me: ctx.me }, // Пробрасываем строго типизированного пользователя дальше
  })
})

// Динамический Middleware для проверки наличия конкретного пермишена у роли
export const hasPermission = (permission: Permission) =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.me) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Вы не авторизованы',
      })
    }

    // Ищем массив прав для текущей роли пользователя
    const userPermissions = rolePermissions[ctx.me.role as UserRole]
    // Проверяем, есть ли необходимый пермишен в массиве прав роли
    if (!userPermissions || !userPermissions.includes(permission)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Недостаточно прав доступа. Требуется разрешение: ${permission}`,
      })
    }

    return next({
      ctx: { me: ctx.me },
    })
  })

// 5. ГОТОВЫЕ ПРОЦЕДУРЫ ДЛЯ ТВОИХ tRPC РОУТЕРОВ (Procedures)

// Любой авторизованный пользователь (Студент, Препод, Деканат, Админ)
export const authenticatedProcedure = publicProcedure.use(isAuthenticated)

// Процедуры супер-админа (управление токенами ботов, системными пользователями и логами)
export const adminProcedure = publicProcedure.use(hasPermission('manage:bots'))

// Процедуры для сотрудников деканата и админов (импорт студентов, управление кафедрами)
export const deaneryProcedure = publicProcedure.use(
  hasPermission('manage:students')
)

// Процедура для отправки глобальных рассылок (Доступна ADMIN и DEANERY)
export const distributionProcedure = publicProcedure.use(
  hasPermission('create:distribution')
)

// Процедура для преподавателей (и всех кто выше) — например, отправка сообщений в свои группы
export const teacherProcedure = publicProcedure.use(
  hasPermission('create:group-distribution')
)

// 6. СИНХРОННЫЕ ХЕЛПЕРЫ (для UI-элементов на фронтенде или быстрых проверок)
export const getUserRoleHelpers = (role: UserRole | null | undefined) => {
  return {
    isAdmin: role === UserRole.ADMIN,
    isDeanery: role === UserRole.DEANERY,
    isTeacher: role === UserRole.TEACHER,
    isStudent: role === UserRole.STUDENT,
    // Удобные каскадные проверки:
    isAtLeastTeacher:
      role === UserRole.ADMIN ||
      role === UserRole.DEANERY ||
      role === UserRole.TEACHER,
    isAtLeastDeanery: role === UserRole.ADMIN || role === UserRole.DEANERY,
  }
}

export const isAdmin = (role: UserRole | null | undefined) =>
  role === UserRole.ADMIN
export const isDeanery = (role: UserRole | null | undefined) =>
  role === UserRole.DEANERY
export const isTeacher = (role: UserRole | null | undefined) =>
  role === UserRole.TEACHER
export const isStudent = (role: UserRole | null | undefined) =>
  role === UserRole.STUDENT
