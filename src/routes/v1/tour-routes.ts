import { RequestHandler, Router } from 'express'
import { z } from 'zod'
import { tourController } from '../../controllers/tour-controller'
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

const tourSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().optional(),
  price: z.union([
    z.number().positive('Price must be positive'),
    z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, 'Invalid price')
      .refine((value) => Number(value) > 0, 'Price must be positive'),
  ]),
  durationDays: z.coerce.number().int().min(1).optional(),
  active: z.boolean().optional(),
  categoryId: z.string().uuid().nullish(),
  images: z.array(z.string().trim().min(1)).optional(),
  videos: z.array(z.string().trim().min(1)).optional(),
  reviewCriteria: z.array(z.string().trim().min(1)).optional(),
})

router.get('/tours', tourController.list)
router.get('/tours/:id', validateParams(idParams), tourController.getById)

router.post(
  '/tours',
  ...canWrite,
  validateBody(tourSchema),
  tourController.create,
)
router.put(
  '/tours/:id',
  ...canWrite,
  validateParams(idParams),
  validateBody(tourSchema),
  tourController.update,
)
router.delete(
  '/tours/:id',
  ...canWrite,
  validateParams(idParams),
  tourController.remove,
)

export default router
