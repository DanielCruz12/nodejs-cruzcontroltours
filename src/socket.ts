import type { Server as HttpServer } from 'http'
import { Server } from 'socket.io'

let io: Server | null = null

export function initSocket(httpServer: HttpServer): Server {
  const allowedOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.length > 0 ? allowedOrigins : true,
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`)

    socket.on('disconnect', () => {
      console.log(`🔌 Cliente desconectado: ${socket.id}`)
    })
  })

  return io
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO no inicializado')
  return io
}
