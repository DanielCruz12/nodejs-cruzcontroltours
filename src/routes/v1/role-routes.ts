import { Router } from 'express'
import { roleController } from '../../controllers/role-controller'
import { authenticate, authorize } from '../../middlewares/auth'

const router = Router()

// Solo superadmin (es quien gestiona usuarios).
router.get(
  '/roles',
  authenticate,
  authorize('superadmin'),
  roleController.list,
)

export default router
