import { sql } from 'drizzle-orm'
import {
  check,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  uuid,
} from 'drizzle-orm/pg-core'
import { tours } from './tours'

export const departureStatus = pgEnum('departure_status', [
  'open',
  'closed',
  'cancelled',
])

export const tourDepartures = pgTable(
  'tour_departures',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tourId: uuid('tour_id')
      .notNull()
      .references(() => tours.id, { onDelete: 'cascade' }),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    capacity: integer('capacity').notNull(),
    priceOverride: numeric('price_override', { precision: 10, scale: 2 }),
    status: departureStatus('status').notNull().default('open'),
  },
  (table) => [
    check(
      'tour_departures_date_check',
      sql`${table.endDate} >= ${table.startDate}`,
    ),
  ],
)

export type TourDeparture = typeof tourDepartures.$inferSelect
export type NewTourDeparture = typeof tourDepartures.$inferInsert
