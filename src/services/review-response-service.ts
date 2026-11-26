import { and, count, desc, eq, inArray, sql } from 'drizzle-orm'
import { db } from '../db/db'
import {
  reviewAnswers,
  reviewForms,
  reviewQuestions,
  reviewResponses,
  tours,
} from '../db/schemas'

export type SubmitAnswerInput = {
  questionId: string
  ratingValue?: number | null
  textValue?: string | null
}

export type SubmitResponseInput = {
  bookingId?: string | null
  authorName?: string | null
  answers: SubmitAnswerInput[]
}

export type ResponsesQuery = {
  formId?: string
  tourId?: string
  page: number
  limit: number
}

function fail(status: number, message: string): never {
  throw Object.assign(new Error(message), { status })
}

export const reviewResponseService = {
  async submit(token: string, input: SubmitResponseInput) {
    const forms = await db
      .select({ id: reviewForms.id, isActive: reviewForms.isActive })
      .from(reviewForms)
      .where(eq(reviewForms.token, token))
    const form = forms[0]
    if (!form || !form.isActive) {
      fail(404, 'Formulario no disponible')
    }

    const questions = await db
      .select()
      .from(reviewQuestions)
      .where(
        and(
          eq(reviewQuestions.formId, form.id),
          eq(reviewQuestions.isActive, true),
        ),
      )
    const byId = new Map(questions.map((question) => [question.id, question]))

    if (input.answers.length === 0) {
      fail(400, 'Responde al menos una pregunta')
    }
    // Sin duplicados ni preguntas ajenas/inactivas.
    const seen = new Set<string>()
    for (const answer of input.answers) {
      const question = byId.get(answer.questionId)
      if (!question) {
        fail(400, `Pregunta inválida: ${answer.questionId}`)
      }
      if (seen.has(answer.questionId)) {
        fail(400, 'Pregunta duplicada en las respuestas')
      }
      seen.add(answer.questionId)
      if (question.type === 'stars') {
        if (
          answer.ratingValue === undefined ||
          answer.ratingValue === null ||
          !Number.isInteger(answer.ratingValue) ||
          answer.ratingValue < 1 ||
          answer.ratingValue > 5
        ) {
          fail(400, `Calificación inválida en: ${question.label}`)
        }
      } else if (question.type === 'text') {
        if (typeof answer.textValue !== 'string' || answer.textValue.trim() === '') {
          fail(400, `Respuesta vacía en: ${question.label}`)
        }
      }
    }
    // Toda obligatoria debe venir respondida.
    for (const question of questions) {
      if (question.required && !seen.has(question.id)) {
        fail(400, `Falta responder: ${question.label}`)
      }
    }

    return db.transaction(async (tx) => {
      const inserted = await tx
        .insert(reviewResponses)
        .values({
          formId: form.id,
          bookingId: input.bookingId ?? null,
          authorName: input.authorName?.trim() || null,
        })
        .returning({ id: reviewResponses.id })
      const reviewId = inserted[0].id
      await tx.insert(reviewAnswers).values(
        input.answers.map((answer) => {
          const question = byId.get(answer.questionId)
          return {
            reviewId,
            questionId: answer.questionId,
            ratingValue: question?.type === 'stars' ? (answer.ratingValue ?? null) : null,
            textValue:
              question?.type === 'text'
                ? (answer.textValue?.trim() ?? null)
                : (answer.textValue?.trim() || null),
          }
        }),
      )
      return { id: reviewId }
    })
  },

  async list(query: ResponsesQuery) {
    const page = Math.max(1, query.page)
    const limit = Math.min(100, Math.max(1, query.limit))
    const offset = (page - 1) * limit

    const filters = []
    if (query.formId !== undefined) {
      filters.push(eq(reviewResponses.formId, query.formId))
    }
    if (query.tourId !== undefined) {
      filters.push(eq(reviewForms.tourId, query.tourId))
    }
    const where = filters.length > 0 ? and(...filters) : undefined

    const totalRows = await db
      .select({ count: count(reviewResponses.id) })
      .from(reviewResponses)
      .innerJoin(reviewForms, eq(reviewResponses.formId, reviewForms.id))
      .where(where)
    const total = Number(totalRows[0]?.count ?? 0)

    const items = await db
      .select({
        id: reviewResponses.id,
        formId: reviewResponses.formId,
        formTitle: reviewForms.title,
        tourId: reviewForms.tourId,
        tourTitle: tours.title,
        bookingId: reviewResponses.bookingId,
        authorName: reviewResponses.authorName,
        createdAt: reviewResponses.createdAt,
      })
      .from(reviewResponses)
      .innerJoin(reviewForms, eq(reviewResponses.formId, reviewForms.id))
      .innerJoin(tours, eq(reviewForms.tourId, tours.id))
      .where(where)
      .orderBy(desc(reviewResponses.id))
      .limit(limit)
      .offset(offset)

    const answers =
      items.length === 0
        ? []
        : await db
            .select({
              id: reviewAnswers.id,
              reviewId: reviewAnswers.reviewId,
              questionId: reviewAnswers.questionId,
              questionLabel: reviewQuestions.label,
              questionType: reviewQuestions.type,
              ratingValue: reviewAnswers.ratingValue,
              textValue: reviewAnswers.textValue,
            })
            .from(reviewAnswers)
            .innerJoin(
              reviewQuestions,
              eq(reviewAnswers.questionId, reviewQuestions.id),
            )
            .where(
              inArray(
                reviewAnswers.reviewId,
                items.map((item) => item.id),
              ),
            )

    const answersByReview = new Map<string, typeof answers>()
    for (const answer of answers) {
      const list = answersByReview.get(answer.reviewId) ?? []
      list.push(answer)
      answersByReview.set(answer.reviewId, list)
    }

    // Promedio por pregunta de estrellas (sobre todo el filtro, no la página).
    const avgRows = await db
      .select({
        questionId: reviewAnswers.questionId,
        questionLabel: reviewQuestions.label,
        average: sql<number | null>`avg(${reviewAnswers.ratingValue})`,
        count: count(reviewAnswers.id),
      })
      .from(reviewAnswers)
      .innerJoin(reviewQuestions, eq(reviewAnswers.questionId, reviewQuestions.id))
      .innerJoin(reviewResponses, eq(reviewAnswers.reviewId, reviewResponses.id))
      .innerJoin(reviewForms, eq(reviewResponses.formId, reviewForms.id))
      .where(
        and(
          eq(reviewQuestions.type, 'stars'),
          sql`${reviewAnswers.ratingValue} IS NOT NULL`,
          ...(filters.length > 0 ? [and(...filters)] : []),
        ),
      )
      .groupBy(reviewAnswers.questionId, reviewQuestions.label)

    return {
      items: items.map((item) => ({
        ...item,
        answers: answersByReview.get(item.id) ?? [],
      })),
      total,
      page,
      limit,
      averages: avgRows.map((row) => ({
        questionId: row.questionId,
        questionLabel: row.questionLabel,
        average: row.average === null ? null : Number(row.average),
        count: Number(row.count),
      })),
    }
  },
}
