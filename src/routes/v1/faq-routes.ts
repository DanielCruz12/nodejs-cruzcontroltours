import { RequestHandler, Router } from 'express'
import { z } from 'zod'
import { faqController } from '../../controllers/faq-controller'
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

export const faqSchema = z.object({
  question: z.string().trim().min(1, 'Question is required'),
  answer: z.string().trim().min(1, 'Answer is required'),
  active: z.boolean().optional(),
})

const faqUpdateSchema = faqSchema.partial()

router.get('/faqs', faqController.list)
router.get('/faqs/:id', validateParams(idParams), faqController.getById)
router.post(
  '/faqs',
  ...canWrite,
  validateBody(faqSchema),
  faqController.create,
)
router.put(
  '/faqs/:id',
  ...canWrite,
  validateParams(idParams),
  validateBody(faqUpdateSchema),
  faqController.update,
)
router.delete(
  '/faqs/:id',
  ...canWrite,
  validateParams(idParams),
  faqController.remove,
)

export default router
