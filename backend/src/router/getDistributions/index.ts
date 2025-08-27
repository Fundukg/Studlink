import { trpc } from '../../lib/trpc'

export const getDistributionsTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  // Получаем все родительские сообщения (рассылки), исключая личные сообщения студентам
  const distributions = await ctx.prisma.message.findMany({
    where: {
      parentId: null, // Только родительские сообщения (не ответы)
      senderType: 'STAFF', // Только сообщения от сотрудников
      targetType: {
        not: 'STUDENT', // Исключаем личные сообщения студентам
      },
    },
    select: {
      id: true,
      text: true,
      targetType: true,
      createdAt: true,
      // Информация о получателях (в зависимости от типа)
      group: {
        select: {
          name: true,
        },
      },
      department: {
        select: {
          name: true,
        },
      },
      faculty: {
        select: {
          name: true,
        },
      },
      course: true,
      // Добавляем информацию об отправителе
      staff: {
        select: {
          nick: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc', // Сначала новые рассылки
    },
  })

  // Форматируем данные для отображения
  const formattedDistributions = distributions.map((distribution) => {
    // Определяем получателя на основе типа
    let recipient = ''

    switch (distribution.targetType) {
      case 'GROUP':
        recipient = `Группа: ${distribution.group?.name || 'Неизвестная'}`
        break
      case 'DEPARTMENT':
        recipient = `Кафедра: ${distribution.department?.name || 'Неизвестная'}`
        break
      case 'FACULTY':
        recipient = `Факультет: ${distribution.faculty?.name || 'Неизвестный'}`
        break
      case 'COURSE':
        recipient = `Курс: ${distribution.course}`
        break
      case 'ALL':
        recipient = 'Все студенты'
        break
      default:
        recipient = 'Неизвестный получатель'
    }

    return {
      id: distribution.id,
      text: distribution.text,
      recipient,
      createdAt: distribution.createdAt,
      sender: distribution.staff?.nick || 'Неизвестный отправитель',
      targetType: distribution.targetType,
    }
  })

  return { distributions: formattedDistributions }
})
