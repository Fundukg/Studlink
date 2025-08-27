import { sendMessageToStudent } from '../../bot/telegram'
import { trpc } from '../../lib/trpc'
import { zCreateDistributionTrpcInput } from './input'

export const createDistributionTrpcRoute = trpc.procedure
  .input(zCreateDistributionTrpcInput)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.me) {
      throw new Error('Необходима авторизация')
    }

    try {
      switch (input.targetType) {
        case 'STUDENT': {
          // Отправка конкретному студенту
          const student = await ctx.prisma.student.findUnique({
            where: { id: input.targetId },
          })

          if (!student) {
            throw new Error('Студент не найден')
          }

          if (!student.telegramChatId) {
            throw new Error(`Студент ${student.student_id} не имеет Telegram чата`)
          }

          // console.log(`Попытка отправки сообщения студенту ${student.student_id}`)
          const success = await sendMessageToStudent(student.student_id, input.text)

          if (!success) {
            throw new Error(`Не удалось отправить сообщение студенту ${student.student_id}`)
          }

          // console.log(`Сообщение успешно отправлено студенту ${student.student_id}`)
          break
        }

        case 'GROUP': {
          // Отправка всем студентам группы
          const groupStudents = await ctx.prisma.student.findMany({
            where: { groupId: input.targetId },
          })

          if (groupStudents.length === 0) {
            throw new Error('Группа не найдена или в ней нет студентов')
          }

          // console.log(`Отправка сообщения группе, количество студентов: ${groupStudents.length}`)
          let atLeastOneSuccess = false
          const errors: string[] = []

          for (const student of groupStudents) {
            try {
              if (student.telegramChatId) {
                const success = await sendMessageToStudent(student.student_id, input.text)

                if (success) {
                  // console.log(`Сообщение отправлено студенту ${student.student_id} из группы`)
                  atLeastOneSuccess = true
                } else {
                  // Используем try-catch вместо прямого добавления в массив ошибок
                  throw new Error(`Не удалось отправить сообщение студенту ${student.student_id}`)
                }
              } else {
                throw new Error(`Студент ${student.student_id} не имеет Telegram чата`)
              }
            } catch (error: any) {
              // Ловим ошибку и добавляем в массив, но не прерываем цикл
              errors.push(error.message)
              console.error(`Ошибка при отправке студенту ${student.student_id}:`, error.message)
            }
          }

          if (!atLeastOneSuccess) {
            throw new Error(`Не удалось отправить сообщение ни одному студенту в группе. Ошибки: ${errors.join(', ')}`)
          }

          if (errors.length > 0) {
            console.warn('Частичные ошибки при отправке группе:', errors.join(', '))
          }

          break
        }
        case 'COURSE': {
          const courseStudents = await ctx.prisma.student.findMany({
            where: {
              course: input.targetId, // Ищем студентов с указанным курсом
            },
          })

          if (courseStudents.length === 0) {
            throw new Error(`На курсе ${courseStudents} нет студентов`)
          }

          // console.log(`Отправка сообщения курсу ${String(courseStudents)}, количество студентов: ${courseStudents.length}`)

          let atLeastOneSuccess = false
          const errors: string[] = []

          for (const student of courseStudents) {
            try {
              if (student.telegramChatId) {
                const success = await sendMessageToStudent(student.student_id, input.text)

                if (success) {
                  // console.log(`Сообщение отправлено студенту ${student.student_id} с курса ${courseStudents}`)
                  atLeastOneSuccess = true
                } else {
                  throw new Error(`Не удалось отправить сообщение студенту ${student.student_id}`)
                }
              } else {
                throw new Error(`Студент ${student.student_id} не имеет Telegram чата`)
              }
            } catch (error: any) {
              errors.push(error.message)
              console.error(`Ошибка при отправке студенту ${student.student_id}:`, error.message)
            }
          }

          if (!atLeastOneSuccess) {
            throw new Error(
              `Не удалось отправить сообщение ни одному студенту на курсе ${courseStudents}. Ошибки: ${errors.join(', ')}`
            )
          }

          if (errors.length > 0) {
            console.warn('Частичные ошибки при отправке курсу:', errors.join(', '))
          }

          break
        }
        case 'DEPARTMENT': {
          const departmentGroups = await ctx.prisma.group.findMany({
            where: { departmentId: input.targetId },
            select: { id: true },
          })

          if (departmentGroups.length === 0) {
            throw new Error('Кафедра не найдена или на ней нет групп')
          }

          const departmentStudents = await ctx.prisma.student.findMany({
            where: {
              groupId: {
                in: departmentGroups.map((g) => g.id),
              },
            },
          })

          if (departmentStudents.length === 0) {
            throw new Error('На кафедре нет студентов')
          }

          // console.log(`Отправка сообщения кафедре, количество студентов: ${departmentStudents.length}`)
          let atLeastOneSuccess = false
          const errors: string[] = []

          for (const student of departmentStudents) {
            try {
              if (student.telegramChatId) {
                const success = await sendMessageToStudent(student.student_id, input.text)

                if (success) {
                  // console.log(`Сообщение отправлено студенту ${student.student_id} с кафедры`)
                  atLeastOneSuccess = true
                } else {
                  throw new Error(`Не удалось отправить сообщение студенту ${student.student_id}`)
                }
              } else {
                throw new Error(`Студент ${student.student_id} не имеет Telegram чата`)
              }
            } catch (error: any) {
              errors.push(error.message)
              console.error(`Ошибка при отправке студенту ${student.student_id}:`, error.message)
            }
          }

          if (!atLeastOneSuccess) {
            throw new Error(
              `Не удалось отправить сообщение ни одному студенту на кафедре. Ошибки: ${errors.join(', ')}`
            )
          }

          if (errors.length > 0) {
            console.warn('Частичные ошибки при отправке кафедре:', errors.join(', '))
          }

          break
        }

        case 'FACULTY': {
          const facultyDepartments = await ctx.prisma.department.findMany({
            where: { facultyId: input.targetId },
            select: { id: true },
          })

          if (facultyDepartments.length === 0) {
            throw new Error('Факультет не найден или на нем нет кафедр')
          }

          const facultyGroups = await ctx.prisma.group.findMany({
            where: {
              departmentId: {
                in: facultyDepartments.map((d) => d.id),
              },
            },
            select: { id: true },
          })

          if (facultyGroups.length === 0) {
            throw new Error('На факультете нет групп')
          }

          const facultyStudents = await ctx.prisma.student.findMany({
            where: {
              groupId: {
                in: facultyGroups.map((g) => g.id),
              },
            },
          })

          if (facultyStudents.length === 0) {
            throw new Error('На факультете нет студентов')
          }

          // console.log(`Отправка сообщения факультету, количество студентов: ${facultyStudents.length}`)
          let atLeastOneSuccess = false
          const errors: string[] = []

          for (const student of facultyStudents) {
            try {
              if (student.telegramChatId) {
                const success = await sendMessageToStudent(student.student_id, input.text)

                if (success) {
                  // console.log(`Сообщение отправлено студенту ${student.student_id} с факультета`)
                  atLeastOneSuccess = true
                } else {
                  throw new Error(`Не удалось отправить сообщение студенту ${student.student_id}`)
                }
              } else {
                throw new Error(`Студент ${student.student_id} не имеет Telegram чата`)
              }
            } catch (error: any) {
              errors.push(error.message)
              console.error(`Ошибка при отправке студенту ${student.student_id}:`, error.message)
            }
          }

          if (!atLeastOneSuccess) {
            throw new Error(
              `Не удалось отправить сообщение ни одному студенту на факультете. Ошибки: ${errors.join(', ')}`
            )
          }

          if (errors.length > 0) {
            console.warn('Частичные ошибки при отправке факультету:', errors.join(', '))
          }

          break
        }

        case 'ALL': {
          const allStudents = await ctx.prisma.student.findMany()

          if (allStudents.length === 0) {
            throw new Error('В системе нет студентов')
          }

          // console.log(`Отправка сообщения всем студентам, количество: ${allStudents.length}`)
          let atLeastOneSuccess = false
          const errors: string[] = []

          for (const student of allStudents) {
            try {
              if (student.telegramChatId) {
                const success = await sendMessageToStudent(student.student_id, input.text)

                if (success) {
                  // console.log(`Сообщение отправлено студенту ${student.student_id}`)
                  atLeastOneSuccess = true
                } else {
                  throw new Error(`Не удалось отправить сообщение студенту ${student.student_id}`)
                }
              } else {
                throw new Error(`Студент ${student.student_id} не имеет Telegram чата`)
              }
            } catch (error: any) {
              errors.push(error.message)
              console.error(`Ошибка при отправке студенту ${student.student_id}:`, error.message)
            }
          }

          if (!atLeastOneSuccess) {
            throw new Error(`Не удалось отправить сообщение ни одному студенту. Ошибки: ${errors.join(', ')}`)
          }

          if (errors.length > 0) {
            console.warn('Частичные ошибки при отправке всем студентам:', errors.join(', '))
          }

          break
        }

        default:
          throw new Error('Неизвестный тип получателя')
      }
    } catch (error) {
      console.error('Ошибка отправки в Telegram:', error)

      throw error
    }

    // 3. Создаем сообщение в базе данных (только если отправка прошла успешно)
    await ctx.prisma.message.create({
      data: {
        text: input.text, // Текст сообщения
        senderType: 'STAFF', // Тип отправителя (сотрудник)
        staffId: ctx.me.id, // ID сотрудника
        targetType: input.targetType, // Тип получателя

        // 4. Заполняем поле в зависимости от типа получателя
        ...(input.targetType === 'STUDENT' && { recipientStudentId: input.targetId }),
        ...(input.targetType === 'GROUP' && { groupId: input.targetId }),
        ...(input.targetType === 'DEPARTMENT' && { departmentId: input.targetId }),
        ...(input.targetType === 'FACULTY' && { facultyId: input.targetId }),
        ...(input.targetType === 'COURSE' && { course: parseInt(input.targetId!) }),
      },
    })

    return true
  })
