import { eq } from 'drizzle-orm'
import { db } from '../db/db'
import { NewRental, Rental, rentals } from '../db/schemas'

export const rentalService = {
  async list(): Promise<Rental[]> {
    return db.select().from(rentals)
  },

  async getById(id: string): Promise<Rental | null> {
    const rows = await db.select().from(rentals).where(eq(rentals.id, id))
    return rows[0] ?? null
  },

  async create(data: NewRental): Promise<Rental> {
    const rows = await db.insert(rentals).values(data).returning()
    return rows[0]
  },

  async update(id: string, data: Partial<NewRental>): Promise<Rental | null> {
    const rows = await db
      .update(rentals)
      .set(data)
      .where(eq(rentals.id, id))
      .returning()
    return rows[0] ?? null
  },
}
