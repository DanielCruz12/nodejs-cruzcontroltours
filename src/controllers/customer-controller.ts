import { Request, Response } from 'express'
import { customerService } from '../services/customer-service'

export const customerController = {
  async list(_req: Request, res: Response) {
    const data = await customerService.list()
    res.json({ data })
  },

  async getById(req: Request, res: Response) {
    const customer = await customerService.getById(req.params.id)
    if (!customer)
      return res.status(404).json({ message: 'Cliente no encontrado' })
    res.json({ data: customer })
  },

  async create(req: Request, res: Response) {
    const customer = await customerService.create(req.body)
    res.status(201).json({ data: customer })
  },

  async remove(req: Request, res: Response) {
    const ok = await customerService.remove(req.params.id)
    if (!ok) return res.status(404).json({ message: 'Cliente no encontrado' })
    res.status(204).send()
  },
}
