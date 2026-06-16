// src/lib/socket.ts
import { Server as HttpServer } from 'http'
import { Server } from 'socket.io'

let io: Server

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Укажите адрес вашего фронтенда для безопасности
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log('Клиент подключился:', socket.id)
  })

  return io
}

export const getIO = () => {
  if (!io) {throw new Error('Socket.io не инициализирован!')}
  return io
}
