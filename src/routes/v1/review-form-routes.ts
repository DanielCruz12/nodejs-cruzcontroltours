import { RequestHandler, Router } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { reviewFormController } from '../../controllers/review-form-controller'
import { reviewResponseController } from '../../controllers/review-response-controller'
import { authenticate, authorize } from '../../middlewares/auth'
import { validateBody, validateParams } from '../../middlewares/validate'

const router = Router()

// Gestión solo para admin y superadmin (hosts: solo lectura via GET).
const canManage: RequestHandler[] = [
  authenticate,
  authorize('superadmin', 'admin'),
]
const canRead: RequestHandler[] = [
  authenticate,
  authorize('superadmin', 'admin', 'host'),
]

// Envío público con límite propio anti-spam.
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
})

const idParams = z.object({
  id: z.coerce.number().int().min(1),
})

const tokenParams = z.object({
  token: z
    .string()
    .trim()
    .min(8)
    .max(64)
    .regex(/^[a-f0-9]+$/i, 'Token inválido'),
})

// Tipo extensible: para agregar tipos se añade el valor aquí (y en el
// front/panel); la columna es varchar, sin migración de enum.
export const questionTypeEnum = z.enum(['stars', 'text'])

const questionSchema = z.object({
  label: z.string().trim().min(1, 'La pregunta es requerida').max(300),
  type: questionTypeEnum,
  required: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

export const formSchema = z.object({
  tourId: z.coerce.number().int().min(1),
  title: z.string().trim().min(1, 'El título es requerido').max(200),
  questions: z
    .array(questionSchema)
    .min(1, 'Agrega al menos una pregunta')
    .max(30, 'Máximo 30 preguntas'),
})

const formUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  tourId: z.coerce.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
})

const questionUpdateSchema = z.object({
  label: z.string().trim().min(1).max(300).optional(),
  type: questionTypeEnum.optional(),
  required: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

const duplicateSchema = z.object({
  tourId: z.coerce.number().int().min(1),
  title: z.string().trim().min(1, 'El título es requerido').max(200),
  deactivateExisting: z.boolean().optional(),
})

const answerSchema = z.object({
  questionId: z.coerce.number().int().min(1),
  ratingValue: z.number().int().min(1).max(5).nullish(),
  textValue: z.string().max(2000).nullish(),
})

export const submitSchema = z.object({
  bookingId: z.coerce.number().int().min(1).nullish(),
  authorName: z.string().trim().max(120).nullish(),
  answers: z.array(answerSchema).max(50),
})

// ── Rutas públicas (link por token, sin login) ──────────────────────────
router.get(
  '/review-forms/public/:token',
  validateParams(tokenParams),
  reviewFormController.getPublic,
)
router.post(
  '/review-forms/public/:token/submit',
  submitLimiter,
  validateParams(tokenParams),
  validateBody(submitSchema),
  reviewResponseController.submit,
)

// ── Gestión (admin/superadmin) ──────────────────────────────────────────
router.get('/review-forms', ...canRead, reviewFormController.list)
router.get(
  '/review-forms/:id',
  ...canRead,
  validateParams(idParams),
  reviewFormController.getById,
)
router.post(
  '/review-forms',
  ...canManage,
  validateBody(formSchema),
  reviewFormController.create,
)
router.put(
  '/review-forms/:id',
  ...canManage,
  validateParams(idParams),
  validateBody(formUpdateSchema),
  reviewFormController.update,
)
router.delete(
  '/review-forms/:id',
  ...canManage,
  validateParams(idParams),
  reviewFormController.remove,
)
router.post(
  '/review-forms/:id/duplicate',
  ...canManage,
  validateParams(idParams),
  validateBody(duplicateSchema),
  reviewFormController.duplicate,
)
router.post(
  '/review-forms/:id/questions',
  ...canManage,
  validateParams(idParams),
  validateBody(questionSchema),
  reviewFormController.createQuestion,
)
router.put(
  '/review-questions/:id',
  ...canManage,
  validateParams(idParams),
  validateBody(questionUpdateSchema),
  reviewFormController.updateQuestion,
)
router.delete(
  '/review-questions/:id',
  ...canManage,
  validateParams(idParams),
  reviewFormController.removeQuestion,
)

// ── Respuestas (lectura + filtros) ──────────────────────────────────────
router.get('/review-responses', ...canRead, reviewResponseController.list)
router.get(
  '/review-forms/:id/reviews',
  ...canRead,
  validateParams(idParams),
  reviewResponseController.listByForm,
)

export default router
