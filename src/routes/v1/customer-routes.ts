import { Router } from 'express'
import { z } from 'zod'
import { customerController } from '../../controllers/customer-controller'
import { validateBody, validateParams } from '../../middlewares/validate'

const router = Router()

const idParams = z.object({
  id: z.coerce.number().int().min(1),
})

// Formulario de contacto: nombre, teléfono y correo requeridos.
export const customerSchema = z.object({
  nombre: z.string().trim().min(1, 'nombre requerido').max(200),
  telefono: z.string().trim().min(1, 'teléfono requerido').max(50),
  correo: z.string().trim().email('correo inválido').max(255),
  mensaje: z.string().trim().max(2000).optional(),
})

// El formulario es público; lecturas y borrado deberían protegerse con auth.
// TODO: agregar auth (roles) a GET y DELETE cuando se defina.
router.post('/customers', validateBody(customerSchema), customerController.create)
router.get('/customers', customerController.list)
router.get(
  '/customers/:id',
  validateParams(idParams),
  customerController.getById,
)
router.delete(
  '/customers/:id',
  validateParams(idParams),
  customerController.remove,
)

export default router
