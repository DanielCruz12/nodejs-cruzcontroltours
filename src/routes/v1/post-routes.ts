import { RequestHandler, Router } from 'express'
import { z } from 'zod'
import { postController } from '../../controllers/post-controller'
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

export const postSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  excerpt: z.string().trim().max(500).nullish(),
  category: z.string().trim().max(100).nullish(),
  coverImage: z.string().trim().max(2000).nullish(),
  content: z.string().trim().max(100000).nullish(),
  published: z.boolean().optional(),
})

const postUpdateSchema = postSchema.partial()

router.get('/posts', postController.list)
router.get('/posts/:id', validateParams(idParams), postController.getById)
router.post('/posts', ...canWrite, validateBody(postSchema), postController.create)
router.put(
  '/posts/:id',
  ...canWrite,
  validateParams(idParams),
  validateBody(postUpdateSchema),
  postController.update,
)
router.delete(
  '/posts/:id',
  ...canWrite,
  validateParams(idParams),
  postController.remove,
)

export default router
