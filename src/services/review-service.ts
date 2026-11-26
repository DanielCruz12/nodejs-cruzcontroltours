import { eq } from 'drizzle-orm'
import { db } from '../db/db'
import { NewReview, Review, reviews } from '../db/schemas'

export const reviewService = {
  async list(): Promise<Review[]> {
    return db.select().from(reviews)
  },

  async getById(id: string): Promise<Review | null> {
    const rows = await db.select().from(reviews).where(eq(reviews.id, id))
    return rows[0] ?? null
  },

  async getByBookingId(bookingId: string): Promise<Review | null> {
    const rows = await db
      .select()
      .from(reviews)
      .where(eq(reviews.bookingId, bookingId))
    return rows[0] ?? null
  },

  async create(data: NewReview): Promise<Review> {
    const rows = await db.insert(reviews).values(data).returning()
    return rows[0]
  },

  async remove(id: string): Promise<boolean> {
    const rows = await db
      .delete(reviews)
      .where(eq(reviews.id, id))
      .returning({ id: reviews.id })
    return rows.length > 0
  },
}
