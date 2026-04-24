import { PrismaClient } from '@prisma/client';
import { getPasswordHash } from '..//utils/getPasswordHash';
import { env } from '../lib/env';
import { prisma } from '../lib/prisma'



async function createInitialAdmin() {
  try {
    console.log('Checking for existing admin user...');

    // Проверяем, существует ли уже пользователь admin
    const existingAdmin = await prisma.staff.findUnique({
      where: { nick: 'admin' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Хешируем пароль
    const hashedPassword = getPasswordHash('admin');

    // Создаем администратора
    await prisma.staff.create({
      data: {
        nick: 'admin',
        password: hashedPassword
      }
    });

    console.log('Initial admin user created successfully');
    console.log('Login: admin');
    console.log('Password: admin');
    console.log('Please change the password after first login!');

  } catch (error) {
    console.error('Error creating initial admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем инициализацию только если скрипт вызван напрямую
if (require.main === module) {
  createInitialAdmin();
}

export { createInitialAdmin };