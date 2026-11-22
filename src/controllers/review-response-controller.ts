import { Request, Response } from 'express'
import { reviewFormService } from '../services/review-form-service'
import { reviewResponseService } from '../services/review-response-service'

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

function parseListQuery(req: Request) {
  const page = req.query.page ? Number(req.query.page) : 1
  const limit = req.query.limit ? Number(req.query.limit) : 20
  const formId = req.query.formId ? Number(req.query.formId) : undefined
  const tourId = req.query.tourId ? Number(req.query.tourId) : undefined
  for (const value of [page, limit, formId, tourId]) {
    if (value !== undefined && (!Number.isInteger(value) || value < 1)) {
      return null
    }
  }
  return { page, limit, formId, tourId }
}

export const reviewResponseController = {
  async submit(req: Request, res: Response) {
    try {
      const result = await reviewResponseService.submit(
        req.params.token,
        req.body,
      )
      res.status(201).json({ data: result })
    } catch (error) {
      sendError(res, error)
    }
  },

  async list(req: Request, res: Response) {
    try {
      const query = parseListQuery(req)
      if (!query) return res.status(400).json({ message: 'Datos inválidos' })
      const data = await reviewResponseService.list(query)
      res.json({ data })
    } catch (error) {
      sendError(res, error)
    }
  },

  async listByForm(req: Request, res: Response) {
    try {
      const formId = Number(req.params.id)
      const tourId = req.query.tourId ? Number(req.query.tourId) : undefined
      if (tourId !== undefined && (!Number.isInteger(tourId) || tourId < 1)) {
        return res.status(400).json({ message: 'Datos inválidos' })
      }
      const form = await reviewFormService.getById(formId)
      if (!form) return res.status(404).json({ message: 'Form not found' })
      if (tourId !== undefined && tourId !== form.tourId) {
        return res
          .status(400)
          .json({ message: 'El formulario no pertenece a ese tour' })
      }
      const query = parseListQuery(req)
      if (!query) return res.status(400).json({ message: 'Datos inválidos' })
      const data = await reviewResponseService.list({ ...query, formId })
      res.json({ data })
    } catch (error) {
      sendError(res, error)
    }
  },
}
