import { RequestHandler, Router } from 'express'
import { z } from 'zod'
import { departureController } from '../../controllers/departure-controller'
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

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date')

const priceOverride = z
  .union([
    z.number().positive('Price must be positive'),
    z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, 'Invalid price')
      .refine((value) => Number(value) > 0, 'Price must be positive'),
  ])
  .nullish()

const departureObject = z.object({
  tourId: z.string().uuid(),
  startDate: dateString,
  endDate: dateString,
  capacity: z.coerce.number().int().min(1),
  priceOverride,
  status: z.enum(['open', 'closed', 'cancelled']).optional(),
})

export const departureSchema = departureObject.refine(
  (data) => data.endDate >= data.startDate,
  { message: 'End date must be on or after start date' },
)

const departureUpdateSchema = departureObject.partial().refine(
  (data) =>
    data.startDate === undefined ||
    data.endDate === undefined ||
    data.endDate >= data.startDate,
  { message: 'End date must be on or after start date' },
)

router.get('/departures', departureController.list)
router.get(
  '/departures/:id',
  validateParams(idParams),
  departureController.getById,
)
router.post(
  '/departures',
  ...canWrite,
  validateBody(departureSchema),
  departureController.create,
)
router.put(
  '/departures/:id',
  ...canWrite,
  validateParams(idParams),
  validateBody(departureUpdateSchema),
  departureController.update,
)
router.delete(
  '/departures/:id',
  ...canWrite,
  validateParams(idParams),
  departureController.remove,
)

export default router
