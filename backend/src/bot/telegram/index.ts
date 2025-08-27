import { PrismaClient } from '@prisma/client';
import { Telegraf } from 'telegraf';
import type { BotContext } from './types';

const prisma = new PrismaClient();
// eslint-disable-next-line node/no-process-env
const bot = new Telegraf<BotContext>(process.env.TELEGRAM_BOT_TOKEN!);

// Команда для начала работы
bot.start(async (ctx) => {
  await ctx.reply(
    'Добро пожаловать! Для идентификации введите ваш student_id в формате: /auth YOUR_STUDENT_ID'
  );
});

// Команда для идентификации
bot.command('auth', async (ctx) => {
  const studentId = ctx.message.text.split(' ')[1];
  
  if (!studentId) {
    await ctx.reply('Пожалуйста, укажите ваш student_id после команды /auth');
    return;
  }

  try {
    const student = await prisma.student.findUnique({
      where: { student_id: studentId },
    });

    if (!student) {
      await ctx.reply('Студент с таким student_id не найден');
      return;
    }

    await prisma.student.update({
      where: { student_id: studentId },
      data: { telegramChatId: ctx.from.id.toString() },
    });

    await ctx.reply(`Вы успешно идентифицированы как ${student.name}`);
  } catch (error) {
    console.error('Ошибка при идентификации:', error);
    await ctx.reply('Произошла ошибка при идентификации');
  }
});

// Экспорт функций для использования в других частях приложения
export const sendMessageToStudent = async (studentId: string, message: string) => {
 try {
    // Находим студента и его chat_id
    const student = await prisma.student.findUnique({
      where: { student_id: studentId },
    });

    if (!student || !student.telegramChatId) {
      throw new Error('Студент не найден или не авторизован в боте');
    }

    // Отправляем сообщение
    await bot.telegram.sendMessage(student.telegramChatId, message);
    return true;
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
    throw error;
  }
};

export const startBot = () => {
  bot.launch();
//   console.log('Telegram бот запущен');
  
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
};

export default bot;