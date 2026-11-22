import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { tours } from './tours'
import { users } from './users'

export const reviewForms = pgTable('review_forms', {
  id: uuid('id').primaryKey().defaultRandom(),
  tourId: uuid('tour_id')
    .notNull()
    .references(() => tours.id, { onDelete: 'cascade' }),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id),
  title: varchar('title', { length: 200 }).notNull(),
  // Token público aleatorio para el link /review/:token.
  token: varchar('token', { length: 64 }).notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type ReviewForm = typeof reviewForms.$inferSelect
export type NewReviewForm = typeof reviewForms.$inferInsert
