import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  excerpt: text('excerpt'),
  category: varchar('category', { length: 100 }),
  coverImage: text('cover_image'),
  content: text('content'),
  published: boolean('published').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
