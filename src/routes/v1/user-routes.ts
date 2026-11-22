import { Router } from 'express'
import { z } from 'zod'
import { userController } from '../../controllers/user-controller'
import { authenticate, authorize } from '../../middlewares/auth'
import { validateBody, validateParams } from '../../middlewares/validate'

const router = Router()

const idParams = z.object({
  id: z.string().uuid(),
})

const roleEnum = z.enum(['superadmin', 'admin', 'host'])

export const userSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido').max(120),
  email: z.string().trim().email('Correo inválido').max(255),
  password: z.string().min(6, 'Mínimo 6 caracteres').max(100),
  role: roleEnum,
  active: z.boolean().optional(),
})

// En edición la contraseña es opcional: omitida o vacía = conservar.
const userUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email('Correo inválido').max(255).optional(),
  password: z.string().max(100).optional(),
  role: roleEnum.optional(),
  active: z.boolean().optional(),
})

// Solo superadmin gestiona usuarios.
const onlySuperadmin = [authenticate, authorize('superadmin' as const)]

router.get('/users', ...onlySuperadmin, userController.list)
router.get(
  '/users/:id',
  ...onlySuperadmin,
  validateParams(idParams),
  userController.getById,
)
router.post('/users', ...onlySuperadmin, validateBody(userSchema), userController.create)
router.put(
  '/users/:id',
  ...onlySuperadmin,
  validateParams(idParams),
  validateBody(userUpdateSchema),
  userController.update,
)
router.delete(
  '/users/:id',
  ...onlySuperadmin,
  validateParams(idParams),
  userController.remove,
)

export default router
