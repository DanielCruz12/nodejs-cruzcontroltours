import { Request, Response } from 'express'
import { faqService } from '../services/faq-service'

export const faqController = {
  async list(_req: Request, res: Response) {
    const data = await faqService.list()
    res.json({ data })
  },

  async getById(req: Request, res: Response) {
    const faq = await faqService.getById(req.params.id)
    if (!faq) return res.status(404).json({ message: 'FAQ not found' })
    res.json({ data: faq })
  },

  async create(req: Request, res: Response) {
    const faq = await faqService.create(req.body)
    res.status(201).json({ data: faq })
  },

  async update(req: Request, res: Response) {
    const faq = await faqService.update(req.params.id, req.body)
    if (!faq) return res.status(404).json({ message: 'FAQ not found' })
    res.json({ data: faq })
  },

  async remove(req: Request, res: Response) {
    const ok = await faqService.remove(req.params.id)
    if (!ok) return res.status(404).json({ message: 'FAQ not found' })
    res.status(204).send()
  },
}
