import { eq } from 'drizzle-orm'
import { db } from '../db'
import { NewProtocol, Protocol, protocols } from '../db/schema'

export const protocolService = {
  async list(): Promise<Protocol[]> {
    return db.select().from(protocols)
  },

  async getById(id: number): Promise<Protocol | null> {
    const rows = await db
      .select()
      .from(protocols)
      .where(eq(protocols.id, id))
    return rows[0] ?? null
  },

  async create(data: NewProtocol): Promise<Protocol> {
    const rows = await db.insert(protocols).values(data).returning()
    return rows[0]
  },

  async update(
    id: number,
    data: Partial<NewProtocol>,
  ): Promise<Protocol | null> {
    const rows = await db
      .update(protocols)
      .set(data)
      .where(eq(protocols.id, id))
      .returning()
    return rows[0] ?? null
  },

  async remove(id: number): Promise<boolean> {
    const rows = await db
      .delete(protocols)
      .where(eq(protocols.id, id))
      .returning({ id: protocols.id })
    return rows.length > 0
  },
}
