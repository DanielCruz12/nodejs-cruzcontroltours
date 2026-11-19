import { integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core'
import { tours } from './tours'

export const protocols = pgTable('protocols', {
  id: serial('id').primaryKey(),
  tourId: integer('tour_id')
    .notNull()
    .references(() => tours.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
})

export type Protocol = typeof protocols.$inferSelect
export type NewProtocol = typeof protocols.$inferInsert
