import { sql } from 'drizzle-orm'
import {
  check,
  integer,
  pgTable,
  text,
  uuid,
} from 'drizzle-orm/pg-core'
import { reviewQuestions } from './review-questions'
import { reviewResponses } from './review-responses'

export const reviewAnswers = pgTable(
  'review_answers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reviewId: uuid('review_id')
      .notNull()
      .references(() => reviewResponses.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => reviewQuestions.id, { onDelete: 'cascade' }),
    ratingValue: integer('rating_value'),
    textValue: text('text_value'),
  },
  (table) => [
    check(
      'review_answers_rating_check',
      sql`${table.ratingValue} IS NULL OR (${table.ratingValue} >= 1 AND ${table.ratingValue} <= 5)`,
    ),
  ],
)

export type ReviewAnswer = typeof reviewAnswers.$inferSelect
export type NewReviewAnswer = typeof reviewAnswers.$inferInsert
