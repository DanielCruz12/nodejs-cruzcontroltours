import { Request, Response } from 'express'
import { departureService } from '../services/departure-service'
import { tourService } from '../services/tour-service'

export const departureController = {
  async list(req: Request, res: Response) {
    const tourId =
      typeof req.query.tourId === 'string' && req.query.tourId.length > 0
        ? req.query.tourId
        : undefined
    const data = await departureService.list({ tourId })
    res.json({ data })
  },

  async getById(req: Request, res: Response) {
    const departure = await departureService.getById(req.params.id)
    if (!departure)
      return res.status(404).json({ message: 'Departure not found' })
    res.json({ data: departure })
  },

  async create(req: Request, res: Response) {
    const tour = await tourService.getById(req.body.tourId)
    if (!tour) return res.status(404).json({ message: 'Tour not found' })
    const departure = await departureService.create(req.body)
    res.status(201).json({ data: departure })
  },

  async update(req: Request, res: Response) {
    if (req.body.tourId !== undefined) {
      const tour = await tourService.getById(req.body.tourId)
      if (!tour) return res.status(404).json({ message: 'Tour not found' })
    }
    const departure = await departureService.update(
      req.params.id,
      req.body,
    )
    if (!departure)
      return res.status(404).json({ message: 'Departure not found' })
    res.json({ data: departure })
  },

  async remove(req: Request, res: Response) {
    const ok = await departureService.remove(req.params.id)
    if (!ok) return res.status(404).json({ message: 'Departure not found' })
    res.status(204).send()
  },
}
