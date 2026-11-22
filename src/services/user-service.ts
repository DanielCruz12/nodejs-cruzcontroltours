import bcrypt from 'bcrypt'
import { and, eq, ne } from 'drizzle-orm'
import { db } from '../db'
import { roles, users } from '../db/schema'
import type { RoleName } from '../middlewares/auth'
import type { PublicUser } from './auth-service'

export type CreateUserInput = {
  name: string
  email: string
  password: string
  role: RoleName
  active?: boolean
}

export type UpdateUserInput = {
  name?: string
  email?: string
  password?: string
  role?: RoleName
  active?: boolean
}

function conflict(message: string): never {
  throw Object.assign(new Error(message), { status: 409 })
}

async function roleIdByName(role: RoleName): Promise<string> {
  const rows = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, role))
  const found = rows[0]
  if (!found) {
    throw Object.assign(new Error(`Rol "${role}" no existe`), { status: 400 })
  }
  return found.id
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

const publicColumns = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: roles.name,
  active: users.active,
  createdAt: users.createdAt,
}

export const userService = {
  async list(): Promise<PublicUser[]> {
    const rows = await db
      .select(publicColumns)
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .orderBy(users.id)
    return rows.map(toPublicUser)
  },

  async getById(id: string): Promise<PublicUser | null> {
    const rows = await db
      .select(publicColumns)
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, id))
    return rows[0] ? toPublicUser(rows[0]) : null
  },

  async create(input: CreateUserInput): Promise<PublicUser> {
    const email = input.email.trim().toLowerCase()
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
    if (existing.length > 0) conflict('Ese correo ya está registrado')

    const password = await bcrypt.hash(input.password, 10)
    const rows = await db
      .insert(users)
      .values({
        name: input.name.trim(),
        email,
        password,
        roleId: await roleIdByName(input.role),
        active: input.active ?? true,
      })
      .returning({ id: users.id })
    const created = await this.getById(rows[0].id)
    // Acaba de insertarse: siempre existe.
    return created as PublicUser
  },

  async update(id: string, input: UpdateUserInput): Promise<PublicUser | null> {
    const target = await this.getById(id)
    if (!target) return null
    // Un superadmin no se puede editar.
    if (target.role === 'superadmin') {
      throw Object.assign(new Error('No se puede editar un superadmin'), {
        status: 400,
      })
    }
    const patch: Partial<typeof users.$inferInsert> = {}
    if (input.name !== undefined) patch.name = input.name.trim()
    if (input.email !== undefined) {
      const email = input.email.trim().toLowerCase()
      const taken = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, email), ne(users.id, id)))
      if (taken.length > 0) conflict('Ese correo ya está registrado')
      patch.email = email
    }
    // Contraseña vacía u omitida = conservar la actual.
    if (input.password) patch.password = await bcrypt.hash(input.password, 10)
    if (input.role !== undefined) patch.roleId = await roleIdByName(input.role)
    if (input.active !== undefined) patch.active = input.active

    const rows = await db
      .update(users)
      .set(patch)
      .where(eq(users.id, id))
      .returning({ id: users.id })
    if (rows.length === 0) return null
    return this.getById(id)
  },

  async remove(id: string): Promise<boolean> {
    const target = await this.getById(id)
    if (!target) return false
    // Un superadmin no se puede eliminar.
    if (target.role === 'superadmin') {
      throw Object.assign(new Error('No se puede eliminar un superadmin'), {
        status: 400,
      })
    }
    const deleted = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id })
    return deleted.length > 0
  },
}
