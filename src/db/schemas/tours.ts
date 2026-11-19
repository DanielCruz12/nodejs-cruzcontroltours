import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { categories } from './categories'

export const tours = pgTable('tours', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  durationDays: integer('duration_days').notNull().default(1),
  active: boolean('active').notNull().default(true),
  categoryId: integer('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  images: text('images').array().notNull().default([]),
  videos: text('videos').array().notNull().default([]),
  reviewCriteria: jsonb('review_criteria').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Tour = typeof tours.$inferSelect
export type NewTour = typeof tours.$inferInsert
