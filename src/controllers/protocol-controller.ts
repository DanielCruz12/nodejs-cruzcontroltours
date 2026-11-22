import { Request, Response } from 'express'
import { protocolService } from '../services/protocol-service'
import { tourService } from '../services/tour-service'

export const protocolController = {
  async list(_req: Request, res: Response) {
    const data = await protocolService.list()
    res.json({ data })
  },

  async getById(req: Request, res: Response) {
    const protocol = await protocolService.getById(req.params.id)
    if (!protocol)
      return res.status(404).json({ message: 'Protocol not found' })
    res.json({ data: protocol })
  },

  async create(req: Request, res: Response) {
    const tour = await tourService.getById(req.body.tourId)
    if (!tour) return res.status(404).json({ message: 'Tour not found' })
    const protocol = await protocolService.create(req.body)
    res.status(201).json({ data: protocol })
  },

  async update(req: Request, res: Response) {
    if (req.body.tourId !== undefined) {
      const tour = await tourService.getById(req.body.tourId)
      if (!tour) return res.status(404).json({ message: 'Tour not found' })
    }
    const protocol = await protocolService.update(
      req.params.id,
      req.body,
    )
    if (!protocol)
      return res.status(404).json({ message: 'Protocol not found' })
    res.json({ data: protocol })
  },

  async remove(req: Request, res: Response) {
    const ok = await protocolService.remove(req.params.id)
    if (!ok) return res.status(404).json({ message: 'Protocol not found' })
    res.status(204).send()
  },
}
