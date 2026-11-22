import { boolean, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  description: text('description'),
  active: boolean('active').notNull().default(true),
})

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
