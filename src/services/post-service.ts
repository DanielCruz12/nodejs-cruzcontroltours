import { desc, eq } from 'drizzle-orm'
import { db } from '../db/db'
import { NewPost, Post, posts } from '../db/schemas'

export const postService = {
  async list(): Promise<Post[]> {
    return db.select().from(posts).orderBy(desc(posts.createdAt))
  },

  async getById(id: string): Promise<Post | null> {
    const rows = await db.select().from(posts).where(eq(posts.id, id))
    return rows[0] ?? null
  },

  async create(data: NewPost): Promise<Post> {
    const rows = await db.insert(posts).values(data).returning()
    return rows[0]
  },

  async update(id: string, data: Partial<NewPost>): Promise<Post | null> {
    const rows = await db
      .update(posts)
      .set(data)
      .where(eq(posts.id, id))
      .returning()
    return rows[0] ?? null
  },

  async remove(id: string): Promise<boolean> {
    const rows = await db
      .delete(posts)
      .where(eq(posts.id, id))
      .returning({ id: posts.id })
    return rows.length > 0
  },
}
