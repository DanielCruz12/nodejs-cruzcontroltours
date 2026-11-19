import { eq } from 'drizzle-orm'
import { db } from '../db'
import { Faq, faqs, NewFaq } from '../db/schema'

export const faqService = {
  async list(): Promise<Faq[]> {
    return db.select().from(faqs)
  },

  async getById(id: number): Promise<Faq | null> {
    const rows = await db.select().from(faqs).where(eq(faqs.id, id))
    return rows[0] ?? null
  },

  async create(data: NewFaq): Promise<Faq> {
    const rows = await db.insert(faqs).values(data).returning()
    return rows[0]
  },

  async update(id: number, data: Partial<NewFaq>): Promise<Faq | null> {
    const rows = await db
      .update(faqs)
      .set(data)
      .where(eq(faqs.id, id))
      .returning()
    return rows[0] ?? null
  },

  async remove(id: number): Promise<boolean> {
    const rows = await db
      .delete(faqs)
      .where(eq(faqs.id, id))
      .returning({ id: faqs.id })
    return rows.length > 0
  },
}
