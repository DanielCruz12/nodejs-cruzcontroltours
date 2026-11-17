import { NextFunction, Request, Response } from 'express'
import { ZodType } from 'zod'

function invalid(res: Response, issues: unknown) {
  return res.status(400).json({
    message: 'Datos inválidos',
    errors: issues,
  })
}

/** Valida req.body con un schema zod; 400 si falla. */
export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) return invalid(res, result.error.issues)
    req.body = result.data
    next()
  }
}

/** Valida req.params con un schema zod; 400 si falla. */
export function validateParams(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params)
    if (!result.success) return invalid(res, result.error.issues)
    req.params = result.data as any
    next()
  }
}
