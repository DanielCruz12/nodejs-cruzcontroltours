import { RequestHandler, Router } from 'express'
import { z } from 'zod'
import { bookingController } from '../../controllers/booking-controller'
import { authenticate, authorize } from '../../middlewares/auth'
import { validateBody, validateParams } from '../../middlewares/validate'

const router = Router()

// Escritura solo para admin y superadmin (los GET siguen públicos).
const canWrite: RequestHandler[] = [
  authenticate,
  authorize('superadmin', 'admin'),
]

const idParams = z.object({
  id: z.string().uuid(),
})

const totalPriceField = z.union([
  z.number().positive('Price must be positive'),
  z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid price')
    .refine((value) => Number(value) > 0, 'Price must be positive'),
])

export const bookingCreateSchema = z.object({
  tourId: z.string().uuid(),
  departureId: z.string().uuid().nullish(),
  userId: z.string().trim().min(1, 'User is required').max(255),
  guests: z.coerce.number().int().min(1),
  totalPrice: totalPriceField,
  status: z.enum(['pending', 'paid', 'cancelled']).optional(),
})

const bookingUpdateSchema = z.object({
  guests: z.coerce.number().int().min(1).optional(),
  totalPrice: totalPriceField.optional(),
  status: z.enum(['pending', 'paid', 'cancelled']).optional(),
})

// Crear: cualquier rol del panel (host incluido) puede cargar reservas manuales.
const canCreate: RequestHandler[] = [
  authenticate,
  authorize('superadmin', 'admin', 'host'),
]

router.get('/bookings', bookingController.list)
router.get(
  '/bookings/:id',
  validateParams(idParams),
  bookingController.getById,
)
router.post(
  '/bookings',
  ...canCreate,
  validateBody(bookingCreateSchema),
  bookingController.create,
)
router.put(
  '/bookings/:id',
  ...canWrite,
  validateParams(idParams),
  validateBody(bookingUpdateSchema),
  bookingController.update,
)
router.delete(
  '/bookings/:id',
  ...canWrite,
  validateParams(idParams),
  bookingController.remove,
)

export default router
