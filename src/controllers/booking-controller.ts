import { Request, Response } from 'express'
import { bookingService } from '../services/booking-service'

export const bookingController = {
  async list(_req: Request, res: Response) {
    const data = await bookingService.list()
    res.json({ data })
  },

  async getById(req: Request, res: Response) {
    const booking = await bookingService.getById(Number(req.params.id))
    if (!booking)
      return res.status(404).json({ message: 'Booking not found' })
    res.json({ data: booking })
  },

  async update(req: Request, res: Response) {
    const booking = await bookingService.update(
      Number(req.params.id),
      req.body,
    )
    if (!booking)
      return res.status(404).json({ message: 'Booking not found' })
    res.json({ data: booking })
  },

  async remove(req: Request, res: Response) {
    const ok = await bookingService.remove(Number(req.params.id))
    if (!ok) return res.status(404).json({ message: 'Booking not found' })
    res.status(204).send()
  },
}
