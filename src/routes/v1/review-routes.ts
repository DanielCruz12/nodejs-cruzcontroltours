import { Router } from 'express'
import { z } from 'zod'
import { reviewController } from '../../controllers/review-controller'
import { validateBody, validateParams } from '../../middlewares/validate'

const router = Router()

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
  validateParams(idParams),
  reviewController.remove,
)

export default router
