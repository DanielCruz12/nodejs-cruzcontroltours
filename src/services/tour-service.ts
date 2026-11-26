import { eq } from 'drizzle-orm'
import { db } from '../db/db'
import { NewTour, Tour, tours } from '../db/schemas'

export const tourService = {
  async list(): Promise<Tour[]> {
    return db.select().from(tours)
  },

  async getById(id: string): Promise<Tour | null> {
    const rows = await db.select().from(tours).where(eq(tours.id, id))
    return rows[0] ?? null
  },

  async create(data: NewTour): Promise<Tour> {
    const rows = await db.insert(tours).values(data).returning()
    return rows[0]
  },

  async update(id: string, data: Partial<NewTour>): Promise<Tour | null> {
    const rows = await db
      .update(tours)
      .set(data)
      .where(eq(tours.id, id))
      .returning()
    return rows[0] ?? null
  },

  async remove(id: string): Promise<boolean> {
    const rows = await db
      .delete(tours)
      .where(eq(tours.id, id))
      .returning({ id: tours.id })
    return rows.length > 0
  },
}
