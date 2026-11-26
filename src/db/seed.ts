import 'dotenv/config'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { db, pool } from './db'
import { roles, users } from './schemas'

// Correos fijos; las claves se toman de SEED_*_PASSWORD o estos defaults.
// Cámbialas con variables de entorno en producción.
const SEEDS = [
  {
    role: 'superadmin',
    name: 'Super Admin',
    email: 'superadmin@cruzcontroltours.com',
    password: process.env.SEED_SUPERADMIN_PASSWORD || 'SuperAdmin123!',
  },
  {
    role: 'admin',
    name: 'Admin',
    email: 'admin@cruzcontroltours.com',
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin123!',
  },
  {
    role: 'host',
    name: 'Host',
    email: 'host@cruzcontroltours.com',
    password: process.env.SEED_HOST_PASSWORD || 'Host123!',
  },
] as const

const ROLE_DESCRIPTIONS: Record<string, string> = {
  superadmin: 'Acceso total, gestiona usuarios y roles',
  admin: 'Crea, edita y elimina contenido',
  host: 'Solo lectura',
}

async function ensureRole(name: string): Promise<string> {
  const existing = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, name))
  if (existing[0]) return existing[0].id
  const inserted = await db
    .insert(roles)
    .values({ name, description: ROLE_DESCRIPTIONS[name] ?? null })
    .returning({ id: roles.id })
  return inserted[0].id
}

async function main() {
  for (const seed of SEEDS) {
    const roleId = await ensureRole(seed.role)
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, seed.email))
    if (existing[0]) {
      console.log(`= Usuario ya existe: ${seed.email} (${seed.role})`)
      continue
    }
    const password = await bcrypt.hash(seed.password, 10)
    await db.insert(users).values({
      name: seed.name,
      email: seed.email,
      password,
      roleId,
      active: true,
    })
    console.log(`+ Usuario creado: ${seed.email} (${seed.role})`)
  }
}

main()
  .catch((error) => {
    console.error('Seed fallido:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
