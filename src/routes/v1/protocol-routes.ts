import { Router } from 'express'
import { z } from 'zod'
import { protocolController } from '../../controllers/protocol-controller'
import { validateBody, validateParams } from '../../middlewares/validate'

const router = Router()

const idParams = z.object({
  id: z.coerce.number().int().min(1),
})

export const protocolSchema = z.object({
  tourId: z.coerce.number().int().min(1),
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(2000).nullish(),
})

const protocolUpdateSchema = protocolSchema.partial()

router.get('/protocols', protocolController.list)
router.get(
  '/protocols/:id',
  validateParams(idParams),
  protocolController.getById,
)
router.post(
  '/protocols',
  validateBody(protocolSchema),
  protocolController.create,
)
router.put(
  '/protocols/:id',
  validateParams(idParams),
  validateBody(protocolUpdateSchema),
  protocolController.update,
)
router.delete(
  '/protocols/:id',
  validateParams(idParams),
  protocolController.remove,
)

export default router
