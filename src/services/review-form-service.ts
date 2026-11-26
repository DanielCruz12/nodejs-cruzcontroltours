import { randomBytes } from 'node:crypto'
import { and, count, eq, inArray, sql } from 'drizzle-orm'
import { db } from '../db/db'
import {
  reviewAnswers,
  reviewForms,
  reviewQuestions,
  reviewResponses,
  tours,
  type ReviewQuestion,
} from '../db/schemas'

export type QuestionType = 'stars' | 'text'

export type FormQuestionInput = {
  label: string
  type: QuestionType
  required?: boolean
  position?: number
  isActive?: boolean
}

export type CreateFormInput = {
  tourId: string
  title: string
  questions: FormQuestionInput[]
}

export type UpdateFormInput = {
  title?: string
  tourId?: string
  isActive?: boolean
}

export type UpdateQuestionInput = {
  label?: string
  type?: QuestionType
  required?: boolean
  position?: number
  isActive?: boolean
}

function fail(status: number, message: string): never {
  throw Object.assign(new Error(message), { status })
}

async function generateToken(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const token = randomBytes(24).toString('hex')
    const existing = await db
      .select({ id: reviewForms.id })
      .from(reviewForms)
      .where(eq(reviewForms.token, token))
    if (existing.length === 0) return token
  }
  fail(500, 'No se pudo generar un token único')
}

async function ensureTour(tourId: string) {
  const rows = await db
    .select({ id: tours.id })
    .from(tours)
    .where(eq(tours.id, tourId))
  if (rows.length === 0) fail(404, 'Tour not found')
}

async function questionHasAnswers(questionId: string): Promise<boolean> {
  const rows = await db
    .select({ id: reviewAnswers.id })
    .from(reviewAnswers)
    .where(eq(reviewAnswers.questionId, questionId))
    .limit(1)
  return rows.length > 0
}

export const reviewFormService = {
  async list(tourId?: string) {
    const where = tourId !== undefined ? eq(reviewForms.tourId, tourId) : undefined
    const rows = await db
      .select({
        id: reviewForms.id,
        tourId: reviewForms.tourId,
        tourTitle: tours.title,
        title: reviewForms.title,
        token: reviewForms.token,
        isActive: reviewForms.isActive,
        createdAt: reviewForms.createdAt,
      })
      .from(reviewForms)
      .innerJoin(tours, eq(reviewForms.tourId, tours.id))
      .where(where)
      .orderBy(reviewForms.id)

    const questionCounts = await db
      .select({
        formId: reviewQuestions.formId,
        count: count(reviewQuestions.id),
      })
      .from(reviewQuestions)
      .where(eq(reviewQuestions.isActive, true))
      .groupBy(reviewQuestions.formId)
    const responseCounts = await db
      .select({
        formId: reviewResponses.formId,
        count: count(reviewResponses.id),
      })
      .from(reviewResponses)
      .groupBy(reviewResponses.formId)

    const questionsByForm = new Map(questionCounts.map((r) => [r.formId, Number(r.count)]))
    const responsesByForm = new Map(responseCounts.map((r) => [r.formId, Number(r.count)]))
    const formIds = rows.map((row) => row.id)
    const allQuestions =
      formIds.length === 0
        ? []
        : await db
            .select()
            .from(reviewQuestions)
            .where(inArray(reviewQuestions.formId, formIds))
            .orderBy(reviewQuestions.position, reviewQuestions.id)
    const questionsListByForm = new Map<string, ReviewQuestion[]>()
    for (const question of allQuestions) {
      const list = questionsListByForm.get(question.formId) ?? []
      list.push(question)
      questionsListByForm.set(question.formId, list)
    }
    return rows.map((row) => ({
      ...row,
      questionsCount: questionsByForm.get(row.id) ?? 0,
      responsesCount: responsesByForm.get(row.id) ?? 0,
      questions: questionsListByForm.get(row.id) ?? [],
    }))
  },

  async getById(id: string) {
    const rows = await db
      .select({
        id: reviewForms.id,
        tourId: reviewForms.tourId,
        tourTitle: tours.title,
        title: reviewForms.title,
        token: reviewForms.token,
        isActive: reviewForms.isActive,
        createdAt: reviewForms.createdAt,
      })
      .from(reviewForms)
      .innerJoin(tours, eq(reviewForms.tourId, tours.id))
      .where(eq(reviewForms.id, id))
    const form = rows[0]
    if (!form) return null
    const questions = await db
      .select()
      .from(reviewQuestions)
      .where(eq(reviewQuestions.formId, id))
      .orderBy(reviewQuestions.position, reviewQuestions.id)
    return { ...form, questions }
  },

  async create(input: CreateFormInput, ownerId: string) {
    await ensureTour(input.tourId)
    if (input.questions.length === 0) {
      fail(400, 'El formulario necesita al menos una pregunta')
    }
    const token = await generateToken()
    const inserted = await db
      .insert(reviewForms)
      .values({
        tourId: input.tourId,
        ownerId,
        title: input.title.trim(),
        token,
        isActive: true,
      })
      .returning({ id: reviewForms.id })
    const formId = inserted[0].id
    await db.insert(reviewQuestions).values(
      input.questions.map((question, index) => ({
        formId,
        label: question.label.trim(),
        type: question.type,
        required: question.required ?? false,
        position: question.position ?? index,
        isActive: question.isActive ?? true,
      })),
    )
    return this.getById(formId)
  },

  async update(id: string, input: UpdateFormInput) {
    if (input.tourId !== undefined) await ensureTour(input.tourId)
    const patch: Partial<typeof reviewForms.$inferInsert> = {}
    if (input.title !== undefined) patch.title = input.title.trim()
    if (input.tourId !== undefined) patch.tourId = input.tourId
    if (input.isActive !== undefined) patch.isActive = input.isActive
    const rows = await db
      .update(reviewForms)
      .set(patch)
      .where(eq(reviewForms.id, id))
      .returning({ id: reviewForms.id })
    if (rows.length === 0) return null
    return this.getById(id)
  },

  /** Borra el formulario; si ya tiene respuestas, lo desactiva en su lugar. */
  async remove(id: string): Promise<{ deleted: boolean } | null> {
    const existing = await db
      .select({ id: reviewForms.id })
      .from(reviewForms)
      .where(eq(reviewForms.id, id))
    if (existing.length === 0) return null
    const responses = await db
      .select({ id: reviewResponses.id })
      .from(reviewResponses)
      .where(eq(reviewResponses.formId, id))
      .limit(1)
    if (responses.length > 0) {
      await db
        .update(reviewForms)
        .set({ isActive: false })
        .where(eq(reviewForms.id, id))
      return { deleted: false }
    }
    await db.delete(reviewForms).where(eq(reviewForms.id, id))
    return { deleted: true }
  },

  async createQuestion(formId: string, input: FormQuestionInput) {
    const form = await db
      .select({ id: reviewForms.id })
      .from(reviewForms)
      .where(eq(reviewForms.id, formId))
    if (form.length === 0) fail(404, 'Form not found')
    let position = input.position
    if (position === undefined) {
      const rows = await db
        .select({ max: sql<number | null>`max(${reviewQuestions.position})` })
        .from(reviewQuestions)
        .where(eq(reviewQuestions.formId, formId))
      position = Number(rows[0]?.max ?? -1) + 1
    }
    const inserted = await db
      .insert(reviewQuestions)
      .values({
        formId,
        label: input.label.trim(),
        type: input.type,
        required: input.required ?? false,
        position,
        isActive: input.isActive ?? true,
      })
      .returning()
    return inserted[0]
  },

  async updateQuestion(id: string, input: UpdateQuestionInput) {
    const existing = await db
      .select()
      .from(reviewQuestions)
      .where(eq(reviewQuestions.id, id))
    const question = existing[0]
    if (!question) return null
    // Con respuestas no se puede cambiar el tipo (rompería promedios).
    if (
      input.type !== undefined &&
      input.type !== question.type &&
      (await questionHasAnswers(id))
    ) {
      fail(400, 'No se puede cambiar el tipo de una pregunta con respuestas')
    }
    const patch: Partial<typeof reviewQuestions.$inferInsert> = {}
    if (input.label !== undefined) patch.label = input.label.trim()
    if (input.type !== undefined) patch.type = input.type
    if (input.required !== undefined) patch.required = input.required
    if (input.position !== undefined) patch.position = input.position
    if (input.isActive !== undefined) patch.isActive = input.isActive
    const rows = await db
      .update(reviewQuestions)
      .set(patch)
      .where(eq(reviewQuestions.id, id))
      .returning()
    return rows[0]
  },

  /** Quita la pregunta; si tiene respuestas, la desactiva en su lugar. */
  async removeQuestion(id: string): Promise<{ deleted: boolean } | null> {
    const existing = await db
      .select({ id: reviewQuestions.id })
      .from(reviewQuestions)
      .where(eq(reviewQuestions.id, id))
    if (existing.length === 0) return null
    if (await questionHasAnswers(id)) {
      await db
        .update(reviewQuestions)
        .set({ isActive: false })
        .where(eq(reviewQuestions.id, id))
      return { deleted: false }
    }
    await db.delete(reviewQuestions).where(eq(reviewQuestions.id, id))
    return { deleted: true }
  },

  async duplicate(
    id: string,
    input: { tourId: string; title: string; deactivateExisting?: boolean },
    ownerId: string,
  ) {
    const source = await this.getById(id)
    if (!source) return null
    await ensureTour(input.tourId)
    const activeExisting = await db
      .select({ id: reviewForms.id, title: reviewForms.title })
      .from(reviewForms)
      .where(
        and(eq(reviewForms.tourId, input.tourId), eq(reviewForms.isActive, true)),
      )
      .limit(1)
    if (activeExisting.length > 0 && !input.deactivateExisting) {
      throw Object.assign(
        new Error('Ese tour ya tiene un formulario activo'),
        { status: 409, existingForm: activeExisting[0] },
      )
    }
    if (activeExisting.length > 0 && input.deactivateExisting) {
      await db
        .update(reviewForms)
        .set({ isActive: false })
        .where(eq(reviewForms.id, activeExisting[0].id))
    }
    // Copia preguntas (orden y tipo); sin reseñas ni respuestas.
    return this.create(
      {
        tourId: input.tourId,
        title: input.title.trim(),
        questions: source.questions.map((question) => ({
          label: question.label,
          type: question.type as QuestionType,
          required: question.required,
          position: question.position,
          isActive: question.isActive,
        })),
      },
      ownerId,
    )
  },

  /** Vista pública por token: solo formularios activos y preguntas activas. */
  async getPublicByToken(token: string) {
    const rows = await db
      .select({
        id: reviewForms.id,
        title: reviewForms.title,
        tourTitle: tours.title,
        isActive: reviewForms.isActive,
      })
      .from(reviewForms)
      .innerJoin(tours, eq(reviewForms.tourId, tours.id))
      .where(eq(reviewForms.token, token))
    const form = rows[0]
    if (!form || !form.isActive) return null
    const questions = await db
      .select({
        id: reviewQuestions.id,
        label: reviewQuestions.label,
        type: reviewQuestions.type,
        required: reviewQuestions.required,
        position: reviewQuestions.position,
      })
      .from(reviewQuestions)
      .where(
        and(
          eq(reviewQuestions.formId, form.id),
          eq(reviewQuestions.isActive, true),
        ),
      )
      .orderBy(reviewQuestions.position, reviewQuestions.id)
    return {
      title: form.title,
      tourTitle: form.tourTitle,
      questions,
    }
  },
}
