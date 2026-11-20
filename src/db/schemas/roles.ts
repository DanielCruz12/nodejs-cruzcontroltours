import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Role = typeof roles.$inferSelect
export type NewRole = typeof roles.$inferInsert
