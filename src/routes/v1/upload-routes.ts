import { Router } from 'express'
import { uploadFiles } from '../../controllers/upload-controller'
import { authenticate, authorize } from '../../middlewares/auth'
import { upload } from '../../middlewares/upload'

const router = Router()

// Subidas solo para admin y superadmin. POST /api/v1/uploads con
// campo "files" (máx. 20).
router.post(
  '/uploads',
  authenticate,
  authorize('superadmin', 'admin'),
  upload.array('files', 20),
  uploadFiles,
)

export default router
