import { Router } from 'express'
import { z } from 'zod'
import { tourController } from '../../controllers/tour-controller'
import { validateBody, validateParams } from '../../middlewares/validate'

const router = Router()

const idParams = z.object({
  id: z.coerce.number().int().min(1),
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
  categoryId: z.coerce.number().int().min(1).nullish(),
  images: z.array(z.string().trim().min(1)).optional(),
  videos: z.array(z.string().trim().min(1)).optional(),
  reviewCriteria: z.array(z.string().trim().min(1)).optional(),
})

router.get('/tours', tourController.list)
router.get('/tours/:id', validateParams(idParams), tourController.getById)

// TODO: add auth (roles) to write routes once defined.
router.post('/tours', validateBody(tourSchema), tourController.create)
router.put(
  '/tours/:id',
  validateParams(idParams),
  validateBody(tourSchema),
  tourController.update,
)
router.delete('/tours/:id', validateParams(idParams), tourController.remove)

export default router
