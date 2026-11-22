import { pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'
import { tours } from './tours'

export const protocols = pgTable('protocols', {
  id: uuid('id').primaryKey().defaultRandom(),
  tourId: uuid('tour_id')
    .notNull()
    .references(() => tours.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
})

export type Protocol = typeof protocols.$inferSelect
export type NewProtocol = typeof protocols.$inferInsert
