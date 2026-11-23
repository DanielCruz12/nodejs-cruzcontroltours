import { RequestHandler, Router } from 'express'
import { z } from 'zod'
import { rentalController } from '../../controllers/rental-controller'
import { authenticate, authorize } from '../../middlewares/auth'
import { validateBody, validateParams } from '../../middlewares/validate'

const router = Router()

// Solo host y superadmin (ver, crear y editar). Sin borrado: para
// cancelar se usa el status "cancelled".
const canUse: RequestHandler[] = [
  authenticate,
  authorize('superadmin', 'host'),
]

const idParams = z.object({
  id: z.string().uuid(),
})

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date')

const timeString = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
    'Time must be HH:MM or HH:MM:SS',
  )

const statusEnum = z.enum([
  'pending',
  'paid',
  'en_route',
  'completed',
  'cancelled',
])

export const rentalSchema = z.object({
  date: dateString,
  time: timeString,
  status: statusEnum.optional(),
  customerName: z.string().trim().min(1, 'Customer name is required').max(200),
  flightInfo: z.string().trim().max(255).nullish(),
  pickupPlace: z.string().trim().min(1, 'Pickup place is required').max(255),
  destination: z.string().trim().min(1, 'Destination is required').max(255),
  driverName: z.string().trim().max(120).nullish(),
  vehicle: z.string().trim().max(120).nullish(),
  notes: z.string().trim().max(2000).nullish(),
})

const rentalUpdateSchema = rentalSchema.partial()

router.get('/rentals', ...canUse, rentalController.list)
router.get(
  '/rentals/:id',
  ...canUse,
  validateParams(idParams),
  rentalController.getById,
)
router.post(
  '/rentals',
  ...canUse,
  validateBody(rentalSchema),
  rentalController.create,
)
router.put(
  '/rentals/:id',
  ...canUse,
  validateParams(idParams),
  validateBody(rentalUpdateSchema),
  rentalController.update,
)

export default router
