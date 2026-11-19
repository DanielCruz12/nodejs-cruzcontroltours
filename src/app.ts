import bodyParser from 'body-parser'
import cors, { CorsOptions } from 'cors'
import dotenv from 'dotenv'
import express, { NextFunction, Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import hpp from 'hpp'
import path from 'path'
import { pool } from './db'
import { apiRoutes } from './routes/v1'
import { setupSwagger } from './swagger'

dotenv.config()

const app = express()

app.disable('x-powered-by')
app.set('etag', false)

// Si estás detrás de un proxy/load balancer (Heroku, Render, Cloudflare, etc.)
app.set('trust proxy', 1)

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.length === 0 ||
      allowedOrigins.includes(origin)
    ) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

const isProduction = process.env.NODE_ENV === 'production'

app.use(
  helmet({
    contentSecurityPolicy: isProduction ? undefined : false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: isProduction
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    noSniff: true,
    hidePoweredBy: true,
  }),
)

app.use(hpp())

// Cabeceras de seguridad adicionales
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-DNS-Prefetch-Control', 'off')
  res.setHeader('X-Download-Options', 'noopen')
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none')
  next()
})

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máx. 100 peticiones por ventana por IP
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api', apiLimiter)

app.use(
  bodyParser.json({
    limit: '1mb',
    verify: (req: Request, _res: Response, buf: Buffer) => {
      ;(req as any).rawBody = buf.toString()
    },
  }),
)

setupSwagger(app)

//* Salud del servicio (lo consume la página de estado de /)
const startedAt = Date.now()

app.get('/health', async (_req, res) => {
  let database = 'up'
  try {
    await pool.query('SELECT 1')
  } catch {
    database = 'down'
  }
  res.json({
    status: database === 'up' ? 'ok' : 'degraded',
    database,
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
})

//* Define routes
app.use('/api/v1', apiRoutes)

//* Fallback route for undefined endpoints
app.use('/api/v1', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Manejo genérico de errores para no filtrar detalles internos en producción.
// Debe ir después de todas las rutas y middlewares.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  const status = err.status || err.statusCode || 500
  const isProd = process.env.NODE_ENV === 'production'

  const message =
    status === 500 && isProd
      ? 'Internal server error'
      : err.message || 'Unexpected error'

  res.status(status).json({ message })
})

app.use(express.static(path.join(process.cwd(), 'public')))

//* Ruta para la página principal
app.get('/', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'))
})

export default app
