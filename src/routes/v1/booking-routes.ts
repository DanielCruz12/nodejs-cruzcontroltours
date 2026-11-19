import { Router } from 'express'
import { z } from 'zod'
import { bookingController } from '../../controllers/booking-controller'
import { validateBody, validateParams } from '../../middlewares/validate'

const router = Router()

const idParams = z.object({
  id: z.coerce.number().int().min(1),
})

const bookingUpdateSchema = z.object({
  guests: z.coerce.number().int().min(1).optional(),
  totalPrice: z
    .union([
      z.number().positive('Price must be positive'),
      z
        .string()
        .trim()
        .regex(/^\d+(\.\d{1,2})?$/, 'Invalid price')
        .refine((value) => Number(value) > 0, 'Price must be positive'),
    ])
    .optional(),
  status: z.enum(['pending', 'paid', 'cancelled']).optional(),
})

router.get('/bookings', bookingController.list)
router.get(
  '/bookings/:id',
  validateParams(idParams),
  bookingController.getById,
)
router.put(
  '/bookings/:id',
  validateParams(idParams),
  validateBody(bookingUpdateSchema),
  bookingController.update,
)
router.delete(
  '/bookings/:id',
  validateParams(idParams),
  bookingController.remove,
)

export default router
