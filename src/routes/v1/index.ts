import { Router } from 'express'
import bookingRouter from './booking-routes'
import categoryRouter from './category-routes'
import customerRouter from './customer-routes'
import departureRouter from './departure-routes'
import faqRouter from './faq-routes'
import protocolRouter from './protocol-routes'
import reviewRouter from './review-routes'
import tourRouter from './tour-routes'
import uploadRouter from './upload-routes'

const apiRoutes = Router()

apiRoutes.use(bookingRouter)
apiRoutes.use(categoryRouter)
apiRoutes.use(customerRouter)
apiRoutes.use(departureRouter)
apiRoutes.use(faqRouter)
apiRoutes.use(protocolRouter)
apiRoutes.use(reviewRouter)
apiRoutes.use(tourRouter)
apiRoutes.use(uploadRouter)

export { apiRoutes }
