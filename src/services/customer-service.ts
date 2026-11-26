import { desc, eq } from 'drizzle-orm'
import { db } from '../db/db'
import { Customer, customers, NewCustomer } from '../db/schemas'

export const customerService = {
  async list(): Promise<Customer[]> {
    return db
      .select()
      .from(customers)
      .orderBy(desc(customers.createdAt))
  },

  async getById(id: string): Promise<Customer | null> {
    const rows = await db.select().from(customers).where(eq(customers.id, id))
    return rows[0] ?? null
  },

  async create(data: NewCustomer): Promise<Customer> {
    const rows = await db.insert(customers).values(data).returning()
    return rows[0]
  },

  async remove(id: string): Promise<boolean> {
    const rows = await db
      .delete(customers)
      .where(eq(customers.id, id))
      .returning({ id: customers.id })
    return rows.length > 0
  },
}
