import { Router } from 'express'
import customerRouter from './customer-routes'
import tourRouter from './tour-routes'
import uploadRouter from './upload-routes'

const apiRoutes = Router()

apiRoutes.use(customerRouter)
apiRoutes.use(tourRouter)
apiRoutes.use(uploadRouter)

export { apiRoutes }
