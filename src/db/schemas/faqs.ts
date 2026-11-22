import { boolean, pgTable, text, uuid } from 'drizzle-orm/pg-core'

export const faqs = pgTable('faqs', {
  id: uuid('id').primaryKey().defaultRandom(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  active: boolean('active').notNull().default(true),
})

export type Faq = typeof faqs.$inferSelect
export type NewFaq = typeof faqs.$inferInsert
