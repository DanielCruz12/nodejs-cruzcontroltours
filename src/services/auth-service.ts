import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import jwt from 'jsonwebtoken'
import { db } from '../db/db'
import { roles, users } from '../db/schemas'
import type { AuthPayload, RoleName } from '../middlewares/auth'

export type PublicUser = {
  id: string
  name: string
  email: string
  role: RoleName
  active: boolean
  createdAt: Date
}

export type LoginResult = {
  token: string
  user: PublicUser
}

function toPublicUser(row: {
  id: string
  name: string
  email: string
  role: string
  active: boolean
  createdAt: Date
}): PublicUser {
  return { ...row, role: row.role as RoleName }
}

function unauthorized(): never {
  // Mensaje genérico para no revelar si el correo existe.
  throw Object.assign(new Error('Credenciales inválidas'), { status: 401 })
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResult> {
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        password: users.password,
        role: roles.name,
        active: users.active,
        createdAt: users.createdAt,
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.email, email.trim().toLowerCase()))

    const found = rows[0]
    if (!found || !found.active) unauthorized()
    const ok = await bcrypt.compare(password, found.password)
    if (!ok) unauthorized()

    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET no configurado')
    const payload: AuthPayload = {
      sub: found.id,
      email: found.email,
      name: found.name,
      role: found.role as RoleName,
    }
    const token = jwt.sign(payload, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '12h',
    } as jwt.SignOptions)

    const { password: _password, ...user } = found
    return { token, user: toPublicUser(user) }
  },

  async me(userId: string): Promise<PublicUser | null> {
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: roles.name,
        active: users.active,
        createdAt: users.createdAt,
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, userId))
    const found = rows[0]
    if (!found || !found.active) return null
    return toPublicUser(found)
  },
}
