import { Request, Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import { reviewFormService } from '../services/review-form-service'

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
  const body: Record<string, unknown> = { message }
  // En el 409 de duplicar se adjunta el formulario en conflicto.
  const existing = (error as { existingForm?: unknown }).existingForm
  if (status === 409 && existing) body.existingForm = existing
  return res.status(status).json(body)
}

export const reviewFormController = {
  async list(req: Request, res: Response) {
    try {
      const tourId = req.query.tourId ? Number(req.query.tourId) : undefined
      const data = await reviewFormService.list(tourId)
      res.json({ data })
    } catch (error) {
      sendError(res, error)
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const form = await reviewFormService.getById(Number(req.params.id))
      if (!form) return res.status(404).json({ message: 'Form not found' })
      res.json({ data: form })
    } catch (error) {
      sendError(res, error)
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const form = await reviewFormService.create(req.body, req.user?.sub ?? 0)
      res.status(201).json({ data: form })
    } catch (error) {
      sendError(res, error)
    }
  },

  async update(req: Request, res: Response) {
    try {
      const form = await reviewFormService.update(
        Number(req.params.id),
        req.body,
      )
      if (!form) return res.status(404).json({ message: 'Form not found' })
      res.json({ data: form })
    } catch (error) {
      sendError(res, error)
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const result = await reviewFormService.remove(Number(req.params.id))
      if (!result) return res.status(404).json({ message: 'Form not found' })
      // Con respuestas se desactiva en lugar de borrarse.
      if (!result.deleted) {
        const form = await reviewFormService.getById(Number(req.params.id))
        return res.json({ data: form, deactivated: true })
      }
      res.status(204).send()
    } catch (error) {
      sendError(res, error)
    }
  },

  async duplicate(req: AuthRequest, res: Response) {
    try {
      const form = await reviewFormService.duplicate(
        Number(req.params.id),
        req.body,
        req.user?.sub ?? 0,
      )
      if (!form) return res.status(404).json({ message: 'Form not found' })
      res.status(201).json({ data: form })
    } catch (error) {
      sendError(res, error)
    }
  },

  async createQuestion(req: Request, res: Response) {
    try {
      const question = await reviewFormService.createQuestion(
        Number(req.params.id),
        req.body,
      )
      res.status(201).json({ data: question })
    } catch (error) {
      sendError(res, error)
    }
  },

  async updateQuestion(req: Request, res: Response) {
    try {
      const question = await reviewFormService.updateQuestion(
        Number(req.params.id),
        req.body,
      )
      if (!question)
        return res.status(404).json({ message: 'Question not found' })
      res.json({ data: question })
    } catch (error) {
      sendError(res, error)
    }
  },

  async removeQuestion(req: Request, res: Response) {
    try {
      const result = await reviewFormService.removeQuestion(
        Number(req.params.id),
      )
      if (!result)
        return res.status(404).json({ message: 'Question not found' })
      // Con respuestas se desactiva en lugar de borrarse.
      if (!result.deleted) {
        return res.json({ data: { deactivated: true } })
      }
      res.status(204).send()
    } catch (error) {
      sendError(res, error)
    }
  },

  async getPublic(req: Request, res: Response) {
    try {
      const form = await reviewFormService.getPublicByToken(req.params.token)
      if (!form)
        return res.status(404).json({ message: 'Formulario no disponible' })
      res.json({ data: form })
    } catch (error) {
      sendError(res, error)
    }
  },
}
