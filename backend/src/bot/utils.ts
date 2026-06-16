import { BotPlatform } from '@prisma/client'
import { sendOkMessage } from './ok'
import { sendMessageToStudent as sendTg } from './telegram'
import { sendMessageToVkStudent as sendVk } from './vk'

/**
 * Оптимизированная универсальная функция отправки.
 * Использует параллельное выполнение для ускорения рассылки по всем платформам.
 */
export const sendToAnyPlatform = async (
  studentId: string,
  text: string,
  platform: BotPlatform
): Promise<{ success: boolean; error: string }> => {
  const tasks: { name: string; fn: () => Promise<any> }[] = []
  // 1. Формируем список задач в зависимости от платформы
  if (platform === BotPlatform.TELEGRAM || platform === BotPlatform.ALL) {
    tasks.push({ name: 'TG', fn: () => sendTg(studentId, text) })
  }
  if (platform === BotPlatform.VK || platform === BotPlatform.ALL) {
    tasks.push({ name: 'VK', fn: () => sendVk(studentId, text) })
  }
  if (platform === BotPlatform.OK || platform === BotPlatform.ALL) {
    tasks.push({ name: 'OK', fn: () => sendOkMessage(studentId, text) })
  }

  if (tasks.length === 0) {
    return { success: false, error: `Платформа ${platform} не поддерживается или не активна` }
  }

  // 2. Запускаем все задачи параллельно
  // allSettled гарантирует, что мы дождемся результата всех задач, даже если часть упадет
  const results = await Promise.allSettled(tasks.map(t => t.fn()))

  const errors: string[] = []
  let anySuccess = false

  // 3. Анализируем результаты
  results.forEach((result, index) => {
    const taskName = tasks[index].name

    if (result.status === 'fulfilled') {
      const response = result.value
      // Проверяем, что API вернул успех (адаптируй под свои функции отправки)
      if (response && response.success !== false) {
        anySuccess = true
      } else {
        errors.push(`${taskName}: API вернул ошибку`)
      }
    } else {
      // Здесь обрабатываются именно "вылеты" (reject/throw) функций
      // console.error(`Критическая ошибка API ${taskName}:`, result.reason)
      errors.push(`${taskName}: ${result.reason?.message || 'Network Error'}`)
    }
  })

  return {
    success: anySuccess,
    error: errors.join('; '),
  }
}