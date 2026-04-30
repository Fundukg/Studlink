import { BotPlatform } from '@prisma/client';
import { VK } from 'vk-io';
import { prisma } from '../../lib/prisma';
import { botService } from '../botService';

let vkInstance: VK | null = null;

export const initializeVkBot = async (): Promise<void> => {
  try {
    await botService.syncBotsWithEnv();
    const token = await botService.getBotToken(BotPlatform.VK);

    vkInstance = new VK({
      token: token,
    });

    setupVkHandlers();
  } catch (error) {
    console.error('Ошибка инициализации ВК бота:', error);
    throw error;
  }
};

function setupVkHandlers() {
  if (!vkInstance) {throw new Error('ВК бот не инициализирован');}

  const { updates } = vkInstance;

  // Команда /start или /auth
  updates.on('message_new', async (ctx, next) => {
    if (ctx.text?.startsWith('/auth')) {
      const studentId = ctx.text.split(' ')[1];

      if (!studentId) {
        return ctx.send('Пожалуйста, укажите ваш student_id после команды /auth');
      }

      const student = await prisma.student.findUnique({
        where: { student_id: studentId },
      });

      if (!student) {
        return ctx.send('Студент с таким student_id не найден');
      }

      await botService.registerBotUser(student.id, BotPlatform.VK, ctx.peerId.toString());
      return ctx.send(`Вы успешно идентифицированы как ${student.name}`);
    }
    return next();
  });

  // Обработка обычных сообщений
  updates.on('message_new', async (ctx) => {
    if (ctx.isOutbox || ctx.text?.startsWith('/')) {return;}

    const vkPeerId = ctx.peerId.toString();

    const botUser = await prisma.botUser.findFirst({
      where: {
        externalId: vkPeerId,
        bot: { platform: BotPlatform.VK },
      },
      include: { student: true, bot: true },
    });

    if (!botUser) {
      return ctx.send('Сначала выполните команду /auth для идентификации');
    }

    // Сохранение в БД
    await prisma.message.create({
      data: {
        text: ctx.text || '',
        senderType: 'STUDENT',
        studentId: botUser.student.id,
        targetType: 'STAFF',
        externalId: ctx.id.toString(),
        botId: botUser.bot.id,
        platform: BotPlatform.VK,
      },
    });

    // Уведомление админа (через ТГ или лог)
    const adminChatId = process.env.ADMIN_CHAT_ID;
    if (adminChatId) {
       // Здесь можно вызвать getBot() из ТГ модуля, чтобы отправить админу сообщение в ТГ
    }

    await ctx.send('Ваше сообщение сохранено и будет рассмотрено администратором.');
  });
}

export const startVkBot = async () => {
  if (!vkInstance) {await initializeVkBot();}
  await vkInstance!.updates.start();
  console.log('VK бот запущен');
};

// Функция отправки сообщения студенту в ВК
export const sendMessageToVkStudent = async (studentId: string, message: string) => {
  if (!vkInstance) {throw new Error('ВК бот не инициализирован');}
  const chatId = await botService.getChatIdByStudentId(studentId, BotPlatform.VK);
  if (!chatId) {throw new Error('Студент не авторизован в ВК');}
  try {
    // console.log(`[VK] Отправляем сообщение в чат ${chatId}: ${message}`);
    
    await vkInstance.api.messages.send({
      peer_id: Number(chatId),
      message: message,
      // Исправлено: используем целое число
      random_id: Math.floor(Math.random() * 2147483647), 
    });

    return {success: true, error: ''}; // Важно возвращать true для счетчика успеха в роуте
  } catch (error: any) {
    // Выводим реальную ошибку от ВК (например, "Permission denied" или "Can't send messages to this user")
    // console.error(`[VK] Ошибка API при отправке:`, error.message || error);
    // throw error || error.message;
    return {success: false, error: error || error.message};
  }
};