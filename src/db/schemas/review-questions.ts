import {
  boolean,
  integer,
  pgTable,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { reviewForms } from './review-forms'

// Tipo como varchar (no pgEnum) para agregar tipos después sin migraciones
// de enum: hoy 'stars' | 'text'.
export const reviewQuestions = pgTable('review_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('form_id')
    .notNull()
    .references(() => reviewForms.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 300 }).notNull(),
  type: varchar('type', { length: 20 }).notNull().default('stars'),
  required: boolean('required').notNull().default(false),
  position: integer('position').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
})

export type ReviewQuestion = typeof reviewQuestions.$inferSelect
export type NewReviewQuestion = typeof reviewQuestions.$inferInsert
