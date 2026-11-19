import { eq } from 'drizzle-orm'
import { db } from '../db'
import { Booking, bookings, NewBooking } from '../db/schema'

export const bookingService = {
  async list(): Promise<Booking[]> {
    return db.select().from(bookings)
  },

  async getById(id: number): Promise<Booking | null> {
    const rows = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
    return rows[0] ?? null
  },

  async update(
    id: number,
    data: Partial<NewBooking>,
  ): Promise<Booking | null> {
    const rows = await db
      .update(bookings)
      .set(data)
      .where(eq(bookings.id, id))
      .returning()
    return rows[0] ?? null
  },

  async remove(id: number): Promise<boolean> {
    const rows = await db
      .delete(bookings)
      .where(eq(bookings.id, id))
      .returning({ id: bookings.id })
    return rows.length > 0
  },
}
