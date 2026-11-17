import { Router } from 'express'
import { z } from 'zod'
import { tourController } from '../../controllers/tour-controller'
import { validateBody, validateParams } from '../../middlewares/validate'

const router = Router()

const idParams = z.object({
  id: z.coerce.number().int().min(1),
})

const tourSchema = z.object({
  title: z.string().trim().min(1, 'title requerido'),
  description: z.string().optional(),
  price: z.union([z.number().positive(), z.string().min(1)]),
  durationDays: z.coerce.number().int().min(1).optional(),
  active: z.boolean().optional(),
})

router.get('/tours', tourController.list)
router.get('/tours/:id', validateParams(idParams), tourController.getById)

// TODO: agregar auth (roles) a las rutas de escritura cuando se defina.
router.post('/tours', validateBody(tourSchema), tourController.create)
router.put(
  '/tours/:id',
  validateParams(idParams),
  validateBody(tourSchema),
  tourController.update,
)
router.delete('/tours/:id', validateParams(idParams), tourController.remove)

export default router
