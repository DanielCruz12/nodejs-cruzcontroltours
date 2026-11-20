import { Router } from 'express'
import authRouter from './auth-routes'
import bookingRouter from './booking-routes'
import categoryRouter from './category-routes'
import customerRouter from './customer-routes'
import departureRouter from './departure-routes'
import faqRouter from './faq-routes'
import protocolRouter from './protocol-routes'
import reviewRouter from './review-routes'
import roleRouter from './role-routes'
import tourRouter from './tour-routes'
import uploadRouter from './upload-routes'
import userRouter from './user-routes'

const apiRoutes = Router()

apiRoutes.use(authRouter)
apiRoutes.use(bookingRouter)
apiRoutes.use(categoryRouter)
apiRoutes.use(customerRouter)
apiRoutes.use(departureRouter)
apiRoutes.use(faqRouter)
apiRoutes.use(protocolRouter)
apiRoutes.use(reviewRouter)
apiRoutes.use(roleRouter)
apiRoutes.use(tourRouter)
apiRoutes.use(uploadRouter)
apiRoutes.use(userRouter)

export { apiRoutes }
