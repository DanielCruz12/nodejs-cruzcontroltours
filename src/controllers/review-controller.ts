import { Request, Response } from 'express'
import { bookingService } from '../services/booking-service'
import { reviewService } from '../services/review-service'
import { tourService } from '../services/tour-service'

export function coversCriteria(
  criteria: string[],
  ratings: { criterion: string }[],
): boolean {
  if (ratings.length !== criteria.length) return false
  const names = ratings.map((rating) => rating.criterion)
  return criteria.every(
    (criterion) => names.filter((name) => name === criterion).length === 1,
  )
}

export const reviewController = {
  async list(_req: Request, res: Response) {
    const data = await reviewService.list()
    res.json({ data })
  },

  async getById(req: Request, res: Response) {
    const review = await reviewService.getById(Number(req.params.id))
    if (!review) return res.status(404).json({ message: 'Review not found' })
    res.json({ data: review })
  },

  async create(req: Request, res: Response) {
    const { tourId, bookingId, userId, ratings, comment } = req.body
    const booking = await bookingService.getById(bookingId)
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    if (booking.userId !== userId)
      return res
        .status(403)
        .json({ message: 'Booking does not belong to user' })
    if (booking.tourId !== tourId)
      return res
        .status(400)
        .json({ message: 'Booking is for a different tour' })
    const existing = await reviewService.getByBookingId(bookingId)
    if (existing)
      return res.status(409).json({ message: 'Booking already reviewed' })
    const tour = await tourService.getById(tourId)
    if (!tour) return res.status(404).json({ message: 'Tour not found' })
    const criteria = tour.reviewCriteria ?? []
    if (criteria.length === 0)
      return res.status(400).json({ message: 'Tour has no review criteria' })
    if (!coversCriteria(criteria, ratings))
      return res.status(400).json({
        message: 'Ratings must include one score per tour criterion',
      })
    const avg =
      ratings.reduce(
        (sum: number, rating: { score: number }) => sum + rating.score,
        0,
      ) / ratings.length
    const review = await reviewService.create({
      tourId,
      bookingId,
      userId,
      ratings,
      comment: comment ?? null,
      avgRating: avg.toFixed(2),
    })
    res.status(201).json({ data: review })
  },

  async remove(req: Request, res: Response) {
    const ok = await reviewService.remove(Number(req.params.id))
    if (!ok) return res.status(404).json({ message: 'Review not found' })
    res.status(204).send()
  },
}
