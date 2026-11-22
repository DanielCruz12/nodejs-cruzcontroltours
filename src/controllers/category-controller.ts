import { Request, Response } from 'express'
import { categoryService } from '../services/category-service'

export const categoryController = {
  async list(_req: Request, res: Response) {
    const data = await categoryService.list()
    res.json({ data })
  },

  async getById(req: Request, res: Response) {
    const category = await categoryService.getById(req.params.id)
    if (!category)
      return res.status(404).json({ message: 'Category not found' })
    res.json({ data: category })
  },

  async create(req: Request, res: Response) {
    const taken = await categoryService.getBySlug(req.body.slug)
    if (taken) return res.status(409).json({ message: 'Slug already in use' })
    const category = await categoryService.create(req.body)
    res.status(201).json({ data: category })
  },

  async update(req: Request, res: Response) {
    const id = req.params.id
    if (req.body.slug !== undefined) {
      const taken = await categoryService.getBySlug(req.body.slug)
      if (taken && taken.id !== id)
        return res.status(409).json({ message: 'Slug already in use' })
    }
    const category = await categoryService.update(id, req.body)
    if (!category)
      return res.status(404).json({ message: 'Category not found' })
    res.json({ data: category })
  },

  async remove(req: Request, res: Response) {
    const ok = await categoryService.remove(req.params.id)
    if (!ok) return res.status(404).json({ message: 'Category not found' })
    res.status(204).send()
  },
}
