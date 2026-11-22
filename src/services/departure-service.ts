import { eq } from 'drizzle-orm'
import { db } from '../db'
import {
  NewTourDeparture,
  TourDeparture,
  tourDepartures,
} from '../db/schema'

export const departureService = {
  async list(): Promise<TourDeparture[]> {
    return db.select().from(tourDepartures)
  },

  async getById(id: string): Promise<TourDeparture | null> {
    const rows = await db
      .select()
      .from(tourDepartures)
      .where(eq(tourDepartures.id, id))
    return rows[0] ?? null
  },

  async create(data: NewTourDeparture): Promise<TourDeparture> {
    const rows = await db.insert(tourDepartures).values(data).returning()
    return rows[0]
  },

  async update(
    id: string,
    data: Partial<NewTourDeparture>,
  ): Promise<TourDeparture | null> {
    const rows = await db
      .update(tourDepartures)
      .set(data)
      .where(eq(tourDepartures.id, id))
      .returning()
    return rows[0] ?? null
  },

  async remove(id: string): Promise<boolean> {
    const rows = await db
      .delete(tourDepartures)
      .where(eq(tourDepartures.id, id))
      .returning({ id: tourDepartures.id })
    return rows.length > 0
  },
}
