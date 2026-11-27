import { RequestHandler, Router } from 'express'
import { z } from 'zod'
import { customerController } from '../../controllers/customer-controller'
import { authenticate, authorize } from '../../middlewares/auth'
import { validateBody, validateParams } from '../../middlewares/validate'

const router = Router()

// Borrado solo para admin y superadmin. El POST es público (formulario
// de contacto del front) y los GET siguen públicos (los usa el front).
const canWrite: RequestHandler[] = [
  authenticate,
  authorize('superadmin', 'admin'),
]

const idParams = z.object({
  id: z.string().uuid(),
})

// Formulario de contacto: nombre, teléfono y correo requeridos.
// Teléfono secundario y fecha de nacimiento (AAAA-MM-DD) opcionales.
const fechaNacimientoSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'fecha inválida (usa AAAA-MM-DD)')
  .refine((value) => {
    const [year, month, day] = value.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    )
  }, 'fecha inválida')
  .refine((value) => {
    const [year, month, day] = value.split('-').map(Number)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(year, month - 1, day).getTime() <= today.getTime()
  }, 'la fecha de nacimiento no puede ser futura')

export const customerSchema = z.object({
  nombre: z.string().trim().min(1, 'nombre requerido').max(200),
  telefono: z.string().trim().min(1, 'teléfono requerido').max(50),
  telefonoSecundario: z.string().trim().max(50).optional(),
  fechaNacimiento: fechaNacimientoSchema.optional(),
  correo: z.string().trim().email('correo inválido').max(255),
  mensaje: z.string().trim().max(2000).optional(),
})

router.post('/customers', validateBody(customerSchema), customerController.create)
router.get('/customers', customerController.list)
router.get(
  '/customers/:id',
  validateParams(idParams),
  customerController.getById,
)
router.delete(
  '/customers/:id',
  ...canWrite,
  validateParams(idParams),
  customerController.remove,
)

export default router
