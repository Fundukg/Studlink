import { BotPlatform } from '@prisma/client'
import { sendOkMessage } from './ok';
import { sendMessageToStudent as sendTg } from './telegram'
import { sendMessageToVkStudent as sendVk } from './vk'

/**
 * Универсальная функция отправки для использования в циклах рассылки
 * Возвращает объект со статусом для корректной записи в БД
 */
export const sendToAnyPlatform = async (
  studentId: string, 
  text: string, 
  platform: BotPlatform
): Promise<{ success: boolean; error: string }> => {
  try {
    let result: any;

    if (platform === BotPlatform.TELEGRAM ) {
      result = await sendTg(studentId, text);
    } else if (platform === BotPlatform.VK) {
      result = await sendVk(studentId, text);
    }else if (platform === BotPlatform.OK) {
      console.log('🚀 ~ studentId:', studentId)
      result = await sendOkMessage(studentId, text);
    } else if (platform === BotPlatform.ALL) {
      result = await sendVk(studentId, text)
      result.push(result = await sendTg(studentId, text))
      result.push(result = await sendOkMessage(studentId, text))
      
    }else {
      return { success: false, error: `Платформа ${platform} не поддерживается` };
    }

    // Проверяем, что функция отправки вернула положительный результат
    // (Большинство библиотек возвращают объект сообщения при успехе)
    return { success: !!result, error: result ? '' : 'Ошибка при отправке в API' };
    
  } catch (e: any) {
    console.error(`Ошибка отправки (${platform}):`, e);
    return { success: false, error: e.message || 'Неизвестная ошибка API' };
  }
}