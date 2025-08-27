import { PrismaClient } from '@prisma/client';
import { sendMessageToStudent } from '.';

const prisma = new PrismaClient();

// Функция для поиска chat_id по student_id
export const getChatIdByStudentId = async (studentId: string): Promise<string | null> => {
  const student = await prisma.student.findUnique({
    where: { student_id: studentId },
    select: { telegramChatId: true },
  });
  
  return student?.telegramChatId || null;
};

// Функция для массовой отправки сообщений
export const sendBulkMessages = async (studentIds: string[], message: string) => {
  const results = await Promise.allSettled(
    studentIds.map(id => sendMessageToStudent(id, message))
  );
  
  return results;
};