import { UserRole } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { getPasswordHash } from '../utils/getPasswordHash'

async function createInitialAdmin() {
  try {
    console.log('Checking for existing admin user...')

    // Проверяем, существует ли уже пользователь с ником admin
    const existingAdmin = await prisma.user.findUnique({
      where: { nick: 'admin' },
    })

    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }

    // Хешируем пароль
    const hashedPassword = getPasswordHash('admin')

    // Создаем администратора в модели User
    await prisma.user.create({
      data: {
        nick: 'admin',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: UserRole.ADMIN,
      },
    })

    console.log('Initial admin user created successfully')
    console.log('Login: admin')
    console.log('Password: admin')
    console.log('IMPORTANT: Please change the password immediately!')
  } catch (error) {
    console.error('Error creating initial admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  createInitialAdmin()
}

export { createInitialAdmin }
