import { Request, Response } from 'express'
import { postService } from '../services/post-service'

export const postController = {
  async list(_req: Request, res: Response) {
    const data = await postService.list()
    res.json({ data })
  },

  async getById(req: Request, res: Response) {
    const post = await postService.getById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    res.json({ data: post })
  },

  async create(req: Request, res: Response) {
    const post = await postService.create(req.body)
    res.status(201).json({ data: post })
  },

  async update(req: Request, res: Response) {
    const post = await postService.update(req.params.id, req.body)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    res.json({ data: post })
  },

  async remove(req: Request, res: Response) {
    const ok = await postService.remove(req.params.id)
    if (!ok) return res.status(404).json({ message: 'Post not found' })
    res.status(204).send()
  },
}
