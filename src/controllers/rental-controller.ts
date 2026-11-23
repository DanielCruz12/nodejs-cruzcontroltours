import { Request, Response } from 'express'
import { rentalService } from '../services/rental-service'

export const rentalController = {
  async list(_req: Request, res: Response) {
    const data = await rentalService.list()
    res.json({ data })
  },

  async getById(req: Request, res: Response) {
    const rental = await rentalService.getById(req.params.id)
    if (!rental) return res.status(404).json({ message: 'Rental not found' })
    res.json({ data: rental })
  },

  async create(req: Request, res: Response) {
    const rental = await rentalService.create(req.body)
    res.status(201).json({ data: rental })
  },

  async update(req: Request, res: Response) {
    const rental = await rentalService.update(req.params.id, req.body)
    if (!rental) return res.status(404).json({ message: 'Rental not found' })
    res.json({ data: rental })
  },
}
