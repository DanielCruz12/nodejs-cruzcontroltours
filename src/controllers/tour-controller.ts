import { Request, Response } from 'express'
import { tourService } from '../services/tour-service'

export const tourController = {
  async list(_req: Request, res: Response) {
    const data = await tourService.list()
    res.json({ data })
  },

  async getById(req: Request, res: Response) {
    const tour = await tourService.getById(req.params.id)
    if (!tour) return res.status(404).json({ message: 'Tour no encontrado' })
    res.json({ data: tour })
  },

  async create(req: Request, res: Response) {
    const tour = await tourService.create(req.body)
    res.status(201).json({ data: tour })
  },

  async update(req: Request, res: Response) {
    const tour = await tourService.update(req.params.id, req.body)
    if (!tour) return res.status(404).json({ message: 'Tour no encontrado' })
    res.json({ data: tour })
  },

  async remove(req: Request, res: Response) {
    const ok = await tourService.remove(req.params.id)
    if (!ok) return res.status(404).json({ message: 'Tour no encontrado' })
    res.status(204).send()
  },
}
