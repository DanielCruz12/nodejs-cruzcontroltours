import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export type RoleName = 'superadmin' | 'admin' | 'host'

export type AuthPayload = {
  sub: string
  email: string
  name: string
  role: RoleName
}

export type AuthRequest = Request & { user?: AuthPayload }

function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET no configurado')
  return secret
}

/** Exige un JWT válido en `Authorization: Bearer …`; 401 si falta o expiró. */
export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization
  const token =
    header && header.startsWith('Bearer ') ? header.slice(7).trim() : null
  if (!token) {
    return res.status(401).json({ message: 'No autenticado' })
  }
  try {
    req.user = jwt.verify(token, getSecret()) as unknown as AuthPayload
    next()
  } catch {
    return res.status(401).json({ message: 'Sesión inválida o expirada' })
  }
}

/** Exige uno de los roles indicados; 403 si el rol no alcanza. */
export function authorize(...allowed: RoleName[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' })
    }
    if (!allowed.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'No tienes permiso para esta acción' })
    }
    next()
  }
}
