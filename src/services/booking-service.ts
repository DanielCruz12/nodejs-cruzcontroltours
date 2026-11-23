import { eq } from 'drizzle-orm'
import { db } from '../db'
import {
  Booking,
  bookings,
  NewBooking,
  tourDepartures,
  tours,
} from '../db/schema'

function fail(status: number, message: string): never {
  throw Object.assign(new Error(message), { status })
}

async function ensureTour(tourId: string) {
  const rows = await db
    .select({ id: tours.id })
    .from(tours)
    .where(eq(tours.id, tourId))
  if (rows.length === 0) fail(404, 'Tour not found')
}

async function ensureDeparture(departureId: string) {
  const rows = await db
    .select({ id: tourDepartures.id })
    .from(tourDepartures)
    .where(eq(tourDepartures.id, departureId))
  if (rows.length === 0) fail(404, 'Departure not found')
}

export const bookingService = {
  async list(): Promise<Booking[]> {
    return db.select().from(bookings)
  },

  async getById(id: string): Promise<Booking | null> {
    const rows = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
    return rows[0] ?? null
  },

  async create(data: NewBooking): Promise<Booking> {
    await ensureTour(data.tourId)
    if (data.departureId) await ensureDeparture(data.departureId)
    const rows = await db.insert(bookings).values(data).returning()
    return rows[0]
  },

  async update(
    id: string,
    data: Partial<NewBooking>,
  ): Promise<Booking | null> {
    const rows = await db
      .update(bookings)
      .set(data)
      .where(eq(bookings.id, id))
      .returning()
    return rows[0] ?? null
  },

  async remove(id: string): Promise<boolean> {
    const rows = await db
      .delete(bookings)
      .where(eq(bookings.id, id))
      .returning({ id: bookings.id })
    return rows.length > 0
  },
}
