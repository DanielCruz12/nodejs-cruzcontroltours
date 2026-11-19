import { Router } from 'express'
import { z } from 'zod'
import { faqController } from '../../controllers/faq-controller'
import { validateBody, validateParams } from '../../middlewares/validate'

const router = Router()

const idParams = z.object({
  id: z.coerce.number().int().min(1),
})

export const faqSchema = z.object({
  question: z.string().trim().min(1, 'Question is required'),
  answer: z.string().trim().min(1, 'Answer is required'),
  active: z.boolean().optional(),
})

const faqUpdateSchema = faqSchema.partial()

router.get('/faqs', faqController.list)
router.get('/faqs/:id', validateParams(idParams), faqController.getById)
router.post('/faqs', validateBody(faqSchema), faqController.create)
router.put(
  '/faqs/:id',
  validateParams(idParams),
  validateBody(faqUpdateSchema),
  faqController.update,
)
router.delete('/faqs/:id', validateParams(idParams), faqController.remove)

export default router
