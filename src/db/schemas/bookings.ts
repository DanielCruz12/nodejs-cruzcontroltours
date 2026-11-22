import { sql } from 'drizzle-orm'
import {
  check,
  integer,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { tourDepartures } from './tour-departures'
import { tours } from './tours'

export const bookingStatus = pgEnum('booking_status', [
  'pending',
  'paid',
  'cancelled',
])

export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tourId: uuid('tour_id')
      .notNull()
      .references(() => tours.id),
    departureId: uuid('departure_id').references(() => tourDepartures.id, {
      onDelete: 'set null',
    }),
    userId: varchar('user_id', { length: 255 }).notNull(),
    guests: integer('guests').notNull(),
    totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
    status: bookingStatus('status').notNull().default('pending'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [check('bookings_guests_check', sql`${table.guests} > 0`)],
)

export type Booking = typeof bookings.$inferSelect
export type NewBooking = typeof bookings.$inferInsert
