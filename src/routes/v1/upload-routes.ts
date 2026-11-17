import { Router } from 'express'
import { uploadFiles } from '../../controllers/upload-controller'
import { upload } from '../../middlewares/upload'

const router = Router()

// Ejemplo multer: POST /api/v1/uploads con campo "files" (máx. 20).
router.post('/uploads', upload.array('files', 20), uploadFiles)

export default router
