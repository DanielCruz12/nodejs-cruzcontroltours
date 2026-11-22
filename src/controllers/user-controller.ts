import { Request, Response } from 'express'
import { userService } from '../services/user-service'

function sendError(res: Response, error: unknown) {
  const status =
    (error as { status?: number }).status &&
    Number.isInteger((error as { status?: number }).status)
      ? ((error as { status?: number }).status as number)
      : 500
  const message =
    error instanceof Error && error.message
      ? error.message
      : 'Unexpected error'
  return res.status(status).json({ message })
}

export const userController = {
  async list(_req: Request, res: Response) {
    try {
      const data = await userService.list()
      res.json({ data })
    } catch (error) {
      sendError(res, error)
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const user = await userService.getById(req.params.id)
      if (!user) return res.status(404).json({ message: 'User not found' })
      res.json({ data: user })
    } catch (error) {
      sendError(res, error)
    }
  },

  async create(req: Request, res: Response) {
    try {
      const user = await userService.create(req.body)
      res.status(201).json({ data: user })
    } catch (error) {
      sendError(res, error)
    }
  },

  async update(req: Request, res: Response) {
    try {
      const user = await userService.update(req.params.id, req.body)
      if (!user) return res.status(404).json({ message: 'User not found' })
      res.json({ data: user })
    } catch (error) {
      sendError(res, error)
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const ok = await userService.remove(req.params.id)
      if (!ok) return res.status(404).json({ message: 'User not found' })
      res.status(204).send()
    } catch (error) {
      sendError(res, error)
    }
  },
}
