import { Request, Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import { authService } from '../services/auth-service'

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

export const authController = {
  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body.email, req.body.password)
      res.json({ data: result })
    } catch (error) {
      sendError(res, error)
    }
  },

  async me(req: AuthRequest, res: Response) {
    try {
      const user = await authService.me(req.user?.sub ?? '')
      if (!user) return res.status(401).json({ message: 'No autenticado' })
      res.json({ data: user })
    } catch (error) {
      sendError(res, error)
    }
  },
}
