import { boolean, pgTable, serial, text } from 'drizzle-orm/pg-core'

export const faqs = pgTable('faqs', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  active: boolean('active').notNull().default(true),
})

export type Faq = typeof faqs.$inferSelect
export type NewFaq = typeof faqs.$inferInsert
