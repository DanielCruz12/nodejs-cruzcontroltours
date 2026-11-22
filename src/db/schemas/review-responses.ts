import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { bookings } from './bookings'
import { reviewForms } from './review-forms'

// Se llama review_responses porque `reviews` ya existe (sistema anterior).
export const reviewResponses = pgTable('review_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('form_id')
    .notNull()
    .references(() => reviewForms.id, { onDelete: 'cascade' }),
  bookingId: uuid('booking_id').references(() => bookings.id, {
    onDelete: 'set null',
  }),
  authorName: varchar('author_name', { length: 120 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type ReviewResponse = typeof reviewResponses.$inferSelect
export type NewReviewResponse = typeof reviewResponses.$inferInsert
