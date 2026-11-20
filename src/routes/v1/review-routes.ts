import { RequestHandler, Router } from 'express'
import { z } from 'zod'
import { reviewController } from '../../controllers/review-controller'
import { authenticate, authorize } from '../../middlewares/auth'
import { validateBody, validateParams } from '../../middlewares/validate'

const router = Router()

// Borrado solo para admin y superadmin. El POST es público (lo envían
// los clientes) y los GET siguen públicos (los usa el front).
const canWrite: RequestHandler[] = [
  authenticate,
  authorize('superadmin', 'admin'),
]

const idParams = z.object({
  id: z.coerce.number().int().min(1),
})

const ratingSchema = z.object({
  criterion: z.string().trim().min(1, 'Criterion is required'),
  score: z.coerce.number().int().min(1).max(5),
})

export const reviewSchema = z.object({
  tourId: z.coerce.number().int().min(1),
  bookingId: z.coerce.number().int().min(1),
  userId: z.string().trim().min(1, 'User is required').max(255),
  ratings: z.array(ratingSchema).min(1, 'At least one rating is required'),
  comment: z.string().trim().max(2000).nullish(),
})

router.get('/reviews', reviewController.list)
router.get('/reviews/:id', validateParams(idParams), reviewController.getById)
router.post('/reviews', validateBody(reviewSchema), reviewController.create)
router.delete(
  '/reviews/:id',
  ...canWrite,
  validateParams(idParams),
  reviewController.remove,
)

export default router
