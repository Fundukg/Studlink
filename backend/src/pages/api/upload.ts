import fs from 'fs'
import parse from 'csv-parser' // Исправлен импорт
import multer from 'multer'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

// Настройка multer
const upload = multer({ dest: '/tmp' })

export const config = {
  api: { bodyParser: false },
}

// Хелпер для запуска middleware multer в API Route
function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*') // В продакшене лучше указать домен
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  try {
    // Выполняем загрузку файла
    await runMiddleware(req, res, upload.single('file'))

    const extendedReq = req as NextApiRequest & { file: Express.Multer.File }
    if (!extendedReq.file) {
      return res.status(400).json({ error: 'Файл не найден' })
    }

    const results: any[] = []
    const filePath = extendedReq.file.path

    // Читаем CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(parse({ separator: ',' } as any))
        .on('data', (data) => results.push(data))
        .on('error', reject)
        .on('end', resolve)
    })

    // const report = await processStudents(results)
    fs.unlinkSync(filePath) // Очистка
    // res.status(200).json(report)
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Ошибка сервера' })
  }
}

// Вспомогательная функция для определения курса
function getCourseFromGroupName(groupName: string): number {
  const digits = groupName.replace(/\D/g, '')
  // Берем вторую цифру, если она есть, иначе по умолчанию 1 курс
  return digits.length >= 2 ? parseInt(digits[1]) : 1
}

export async function processStudents(data: any[], prismaInstance: any) {
  const errors: { row: number; message: string }[] = []
  let importedCount = 0

  const groups = await prismaInstance.group.findMany()
  const groupMap = new Map(groups.map((g: any) => [g.name, g.id]))

  for (const [index, row] of data.entries()) {
    const { lastName, firstName, middleName, studentCard, groupName } = row
    const rowNumber = index + 1

    // 1. Валидация полей
    if (!lastName || !firstName || !studentCard || !groupName) {
      errors.push({ row: rowNumber, message: 'Отсутствуют обязательные поля' })
      continue
    }

    // 2. Валидация группы
    const groupId = groupMap.get(groupName)
    if (!groupId) {
      errors.push({
        row: rowNumber,
        message: `Группа ${groupName} не найдена`,
      })
      continue
    }

    // 3. Проверка уникальности ДО транзакции (избегаем системных ошибок)
    const existing = await prismaInstance.studentProfile.findUnique({
      where: { student_id: studentCard },
    })
    if (existing) {
      errors.push({
        row: rowNumber,
        message: `Студент с зачеткой ${studentCard} уже существует`,
      })
      continue
    }

    // 4. Импорт
    const autoCourse = getCourseFromGroupName(groupName)

    try {
      await prismaInstance.$transaction(async (tx: any) => {
        const user = await tx.user.create({
          data: {
            lastName,
            firstName,
            middleName: middleName || null,
            role: 'STUDENT',
          },
        })

        await tx.studentProfile.create({
          data: {
            userId: user.id,
            student_id: studentCard,
            course: autoCourse,
            groupId: groupId,
          },
        })
      })
      importedCount++
    } catch (e: any) {
      // Изящная обработка ошибок:
      // Если это ошибка Prisma, берем только код или короткое сообщение
      let msg = 'Ошибка при сохранении'
      if (e.code === 'P2002') {
        msg = 'Данные уже существуют (конфликт уникальных полей)'
      } else if (e.message) {
        msg = e.message.split('\n')[0] // Берем только первую строку сообщения
      }

      errors.push({ row: rowNumber, message: msg })
    }
  }

  return { imported: importedCount, failed: errors.length, errors }
}
