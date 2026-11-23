import {
  date,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const rentalStatus = pgEnum('rental_status', [
  'pending',
  'paid',
  'en_route',
  'completed',
  'cancelled',
])

export const rentals = pgTable('rentals', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date').notNull(),
  time: time('time').notNull(),
  status: rentalStatus('status').notNull().default('pending'),
  customerName: varchar('customer_name', { length: 200 }).notNull(),
  flightInfo: varchar('flight_info', { length: 255 }),
  pickupPlace: varchar('pickup_place', { length: 255 }).notNull(),
  destination: varchar('destination', { length: 255 }).notNull(),
  driverName: varchar('driver_name', { length: 120 }),
  vehicle: varchar('vehicle', { length: 120 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type Rental = typeof rentals.$inferSelect
export type NewRental = typeof rentals.$inferInsert
