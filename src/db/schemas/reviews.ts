import {
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { bookings } from './bookings'
import { tours } from './tours'

export type Rating = {
  criterion: string
  score: number
}

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  tourId: uuid('tour_id')
    .notNull()
    .references(() => tours.id, { onDelete: 'cascade' }),
  bookingId: uuid('booking_id')
    .notNull()
    .unique()
    .references(() => bookings.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 }).notNull(),
  ratings: jsonb('ratings').$type<Rating[]>().notNull(),
  avgRating: numeric('avg_rating', { precision: 3, scale: 2 }).notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Review = typeof reviews.$inferSelect
export type NewReview = typeof reviews.$inferInsert
