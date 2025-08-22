import { trpc } from '../../lib/trpc'

export const getDialoguesTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  // Получаем все родительские сообщения (рассылки)
  const distributions = await ctx.prisma.message.findMany({
    where: {
      parentId: null, // Только родительские сообщения (не ответы)
      senderType: 'STAFF', // Только сообщения от сотрудников
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
        }
      },
      department: {
        select: {
          name: true,
        }
      },
      faculty: {
        select: {
          name: true,
        }
      },
      recipientStudent: {
        select: {
          name: true,
          student_id: true,
        }
      },
      course: true,
    },
    orderBy: {
      createdAt: 'desc', // Сначала новые рассылки
    },
  })

  // Форматируем данные для отображения
  const formattedDistributions = distributions.map(distribution => {
    // Определяем получателя на основе типа
    let recipient = '';

    switch (distribution.targetType) {
      case 'STUDENT':
        recipient = `Студент: ${distribution.recipientStudent?.name || 'Неизвестный'} (${distribution.recipientStudent?.student_id || 'нет номера'})`;
        break;
      case 'GROUP':
        recipient = `Группа: ${distribution.group?.name || 'Неизвестная'}`;
        break;
      case 'DEPARTMENT':
        recipient = `Кафедра: ${distribution.department?.name || 'Неизвестная'}`;
        break;
      case 'FACULTY':
        recipient = `Факультет: ${distribution.faculty?.name || 'Неизвестный'}`;
        break;
      case 'COURSE':
        recipient = `Курс: ${distribution.course}`;
        break;
      case 'ALL':
        recipient = 'Все студенты';
        break;
    }

    return {
      id: distribution.id,
      text: distribution.text,
      recipient,
      createdAt: distribution.createdAt, // Ссылка на детальную страницу
    }
  })

  return { distributions: formattedDistributions }
})