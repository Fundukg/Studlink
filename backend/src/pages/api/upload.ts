import fs from 'fs'
import parse from 'csv-parser'
import multer from 'multer'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

const upload = multer({ dest: '/tmp' })

export const config = {
  api: { bodyParser: false },
}

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

/**
 * Определяет разделитель CSV по первым строкам текста.
 * Поддерживает запятую, точку с запятой и табуляцию.
 * Возвращает строку-разделитель или выбрасывает ошибку.
 */
function detectDelimiter(text: string): string {
  const delimiters = [',', ';', '\t']
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '')

  // Считаем максимальное количество колонок для каждого разделителя
  const columnCounts = delimiters.map((d) => {
    let maxCols = 0
    for (const line of lines) {
      // Простое разбиение, без учёта экранированных кавычек
      const cols = line.split(d).length
      if (cols > maxCols) {maxCols = cols}
    }
    return maxCols
  })

  const maxColumns = Math.max(...columnCounts)
  if (maxColumns <= 1) {
    throw new Error(
      'Не удалось определить разделитель CSV. Убедитесь, что файл имеет правильный формат (разделители: запятая, точка с запятой, табуляция).'
    )
  }

  // Выбираем разделитель с наибольшим количеством колонок
  const bestIndex = columnCounts.indexOf(maxColumns)
  return delimiters[bestIndex]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  let filePath: string | undefined

  try {
    await runMiddleware(req, res, upload.single('file'))

    const extendedReq = req as NextApiRequest & { file: Express.Multer.File }
    if (!extendedReq.file) {
      return res.status(400).json({ error: 'Файл не найден' })
    }

    filePath = extendedReq.file.path

    // 1. Определяем разделитель по первым строкам файла
    const sampleBuffer = fs.readFileSync(filePath, { encoding: 'utf-8' })
    const separator = detectDelimiter(sampleBuffer)

    // 2. Парсим CSV с выбранным разделителем
    const results: any[] = []
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath!)
        .pipe(parse({ separator }))
        .on('data', (data) => results.push(data))
        .on('error', reject)
        .on('end', resolve)
    })

    // 3. Проверяем наличие данных и обязательных колонок
    if (results.length === 0) {
      fs.unlinkSync(filePath)
      return res
        .status(400)
        .json({ error: 'CSV файл пуст или не содержит строк данных.' })
    }

    const requiredFields = [
      'lastName',
      'firstName',
      'studentCard',
      'groupName',
    ]
    const firstRowKeys = Object.keys(results[0])
    const missingFields = requiredFields.filter(
      (f) => !firstRowKeys.includes(f)
    )

    if (missingFields.length > 0) {
      fs.unlinkSync(filePath)
      return res.status(400).json({
        error: `Отсутствуют обязательные колонки в CSV: ${missingFields.join(', ')}. Проверьте заголовки файла.`,
      })
    }

    // 4. Обрабатываем студентов
    const report = await processStudents(results, prisma)
    fs.unlinkSync(filePath) // очистка
    return res.status(200).json(report)
  } catch (e: any) {
    // Если файл еще не удален, удаляем
    if (filePath) {
      try {
        fs.unlinkSync(filePath)
      } catch (_) { /* empty */ }
    }

    // Определяем код ошибки: если это наша ошибка формата – 400, иначе 500
    const statusCode = e.message?.includes('разделитель') ? 400 : 500
    return res
      .status(statusCode)
      .json({ error: e.message || 'Ошибка сервера' })
  }
}

// Функция getCourseFromGroupName и processStudents остаются без изменений
// (приведены ниже для полноты)
export function getCourseFromGroupName(groupName: string): number {
  const digits = groupName.replace(/\D/g, '')
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

    if (!lastName || !firstName || !studentCard || !groupName) {
      errors.push({ row: rowNumber, message: 'Отсутствуют обязательные поля' })
      continue
    }

    const groupId = groupMap.get(groupName)
    if (!groupId) {
      errors.push({
        row: rowNumber,
        message: `Группа ${groupName} не найдена`,
      })
      continue
    }

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

    const autoCourse = getCourseFromGroupName(groupName)

    try {
      await prismaInstance.$transaction(async (tx: any) => {
        const user = await tx.user.create({
          data: {
            lastName,
            firstName,
            middleName: middleName || null,
            role: 'STUDENT',
            firstLogin: true,
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
      let msg = 'Ошибка при сохранении'
      if (e.code === 'P2002') {
        msg = 'Данные уже существуют (конфликт уникальных полей)'
      } else if (e.message) {
        msg = e.message.split('\n')[0]
      }
      errors.push({ row: rowNumber, message: msg })
    }
  }

  return { imported: importedCount, failed: errors.length, errors }
}
