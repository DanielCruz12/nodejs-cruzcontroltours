import { Router } from 'express'
import { z } from 'zod'
import { categoryController } from '../../controllers/category-controller'
import { validateBody, validateParams } from '../../middlewares/validate'

const router = Router()

const idParams = z.object({
  id: z.coerce.number().int().min(1),
})

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase alphanumeric with dashes',
    ),
  description: z.string().trim().max(2000).nullish(),
  active: z.boolean().optional(),
})

const categoryUpdateSchema = categorySchema.partial()

router.get('/categories', categoryController.list)
router.get(
  '/categories/:id',
  validateParams(idParams),
  categoryController.getById,
)
router.post(
  '/categories',
  validateBody(categorySchema),
  categoryController.create,
)
router.put(
  '/categories/:id',
  validateParams(idParams),
  validateBody(categoryUpdateSchema),
  categoryController.update,
)
router.delete(
  '/categories/:id',
  validateParams(idParams),
  categoryController.remove,
)

export default router
