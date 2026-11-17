import { Router } from 'express'
import tourRouter from './tour-routes'
import uploadRouter from './upload-routes'

const apiRoutes = Router()

apiRoutes.use(tourRouter)
apiRoutes.use(uploadRouter)

export { apiRoutes }
