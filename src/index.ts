import 'dotenv/config'
import http from 'http'
import app from './app'
import { pool } from './db'
import { initSocket } from './socket'

const port = process.env.PORT || 3002

async function main() {
  try {
    // Verifica la conexión a la base de datos antes de levantar el servidor.
    await pool.query('SELECT 1')
    console.log('✅ Database connected')

    // Socket.IO debe recibir las peticiones a /socket.io antes que Express.
    // Si pasamos solo app, Express responde 404 a /socket.io.
    const httpServer = http.createServer((req, res) => {
      if (req.url?.startsWith('/socket.io')) {
        return // no pasar a Express; el listener de Socket.IO atenderá la petición
      }
      app(req, res)
    })
    initSocket(httpServer)
    httpServer.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`)
      console.log(`🔌 Socket.IO disponible en /socket.io`)
    })
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error)
    process.exit(1)
  }
}

main()
