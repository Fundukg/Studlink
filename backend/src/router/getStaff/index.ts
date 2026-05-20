import { trpc } from '../../lib/trpc'
import { isAdmin } from '../../utils/role'

export const getStaffTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  // 1. Проверка прав: только админ может получить список сотрудников
  if (!isAdmin(ctx.me?.role)) {
    throw new Error('Доступ запрещен: недостаточно прав')
  }

  const staffList = await ctx.prisma.staff.findMany({
    select: {
      id: true,
      nick: true,
      firstName: true,
      lastName: true,
      middleName: true,
      role: true,
      // password: true, // Передаем хэш/пароль из БД
      createdAt: true,
      _count: {
        select: {
          sentMessages: true,
          receivedMessages: true,
        },
      },
    },
    orderBy: {
      lastName: 'asc', // Сортируем по фамилии, так логичнее для списка людей
    },
  })

  // ПРИМЕЧАНИЕ ПО ПАРОЛЯМ:
  // Если getPasswordHash использует bcrypt/argon2, расшифровать пароль нельзя.
  // Если вы используете собственную функцию двустороннего шифрования, 
  // здесь нужно прогнать staffList.map и расшифровать поле password.

  return { Staff: staffList }
})