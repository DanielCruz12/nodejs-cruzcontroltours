import { Request, Response } from 'express'
import { bookingService } from '../services/booking-service'

export const bookingController = {
  async list(_req: Request, res: Response) {
    const data = await bookingService.list()
    res.json({ data })
  },

  async getById(req: Request, res: Response) {
    const booking = await bookingService.getById(req.params.id)
    if (!booking)
      return res.status(404).json({ message: 'Booking not found' })
    res.json({ data: booking })
  },

  async create(req: Request, res: Response) {
    try {
      const booking = await bookingService.create(req.body)
      res.status(201).json({ data: booking })
    } catch (error) {
      const status = (error as { status?: number }).status ?? 500
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Unexpected error'
      res.status(status).json({ message })
    }
  },

  async update(req: Request, res: Response) {
    const booking = await bookingService.update(
      req.params.id,
      req.body,
    )
    if (!booking)
      return res.status(404).json({ message: 'Booking not found' })
    res.json({ data: booking })
  },

  async remove(req: Request, res: Response) {
    const ok = await bookingService.remove(req.params.id)
    if (!ok) return res.status(404).json({ message: 'Booking not found' })
    res.status(204).send()
  },
}
