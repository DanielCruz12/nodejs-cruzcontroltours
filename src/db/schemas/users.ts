import {
  boolean,
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { roles } from './roles'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  // Hash bcrypt de la contraseña: nunca se devuelve en la API.
  password: varchar('password', { length: 255 }).notNull(),
  roleId: integer('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'restrict' }),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
