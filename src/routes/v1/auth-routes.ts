import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { authController } from '../../controllers/auth-controller'
import { authenticate } from '../../middlewares/auth'
import { validateBody } from '../../middlewares/validate'

const router = Router()

// Login con límite propio más estricto que el global.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // máx. 30 intentos por ventana por IP
  standardHeaders: true,
  legacyHeaders: false,
})

const loginSchema = z.object({
  email: z.string().trim().email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

router.post(
  '/auth/login',
  loginLimiter,
  validateBody(loginSchema),
  authController.login,
)
router.get('/auth/me', authenticate, authController.me)

export default router
