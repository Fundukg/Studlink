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

export async function processStudents(data: any[], prismaInstance: any) {
  const errors: { row: number; message: string }[] = []
  const validStudents: any[] = []

  // Используем переданный экземпляр prismaInstance
  const groups = await prismaInstance.group.findMany()
  const groupMap = new Map(groups.map((g: any) => [g.name, g.id]))

  for (const [index, row] of data.entries()) {
    const { fullName, studentCard, groupName, course } = row

    if (!fullName || !studentCard || !groupName) {
      errors.push({ row: index + 1, message: 'Отсутствуют обязательные поля' })
      continue
    }

    const groupId = groupMap.get(groupName)
    if (!groupId) {
      errors.push({
        row: index + 1,
        message: `Группа ${groupName} не найдена`,
      })
      continue
    }

    validStudents.push({
      name: fullName,
      student_id: studentCard,
      groupId: groupId,
      course: String(course), // Убедись, что это строка
    })
  }

  if (validStudents.length > 0) {
    await prismaInstance.student.createMany({
      data: validStudents,
      skipDuplicates: true,
    })
  }

  return {
    imported: validStudents.length,
    failed: errors.length,
    errors,
  }
}
