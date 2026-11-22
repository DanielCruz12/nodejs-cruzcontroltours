import { formSchema, submitSchema } from './review-form-routes'

const TOUR_ID = '11111111-1111-4111-8111-111111111111'
const QUESTION_1 = '22222222-2222-4222-8222-222222222222'
const QUESTION_2 = '33333333-3333-4333-8333-333333333333'

describe('formSchema (creador)', () => {
  const baseQuestion = {
    label: '¿Cómo calificarías el tour?',
    type: 'stars',
    required: true,
  }

  it('acepta un formulario válido', () => {
    const result = formSchema.safeParse({
      tourId: TOUR_ID,
      title: 'Encuesta post-tour',
      questions: [baseQuestion],
    })
    expect(result.success).toBe(true)
  })

  it('rechaza tourId que no es UUID', () => {
    const result = formSchema.safeParse({
      tourId: 'no-es-uuid',
      title: 'Encuesta post-tour',
      questions: [baseQuestion],
    })
    expect(result.success).toBe(false)
  })

  it('rechaza sin preguntas', () => {
    const result = formSchema.safeParse({
      tourId: TOUR_ID,
      title: 'Vacío',
      questions: [],
    })
    expect(result.success).toBe(false)
  })

  it('rechaza más de 30 preguntas', () => {
    const result = formSchema.safeParse({
      tourId: TOUR_ID,
      title: 'Largo',
      questions: Array.from({ length: 31 }, (_, i) => ({
        ...baseQuestion,
        label: `Pregunta ${i + 1}`,
      })),
    })
    expect(result.success).toBe(false)
  })

  it('rechaza tipos desconocidos', () => {
    const result = formSchema.safeParse({
      tourId: TOUR_ID,
      title: 'Raro',
      questions: [{ ...baseQuestion, type: 'video' }],
    })
    expect(result.success).toBe(false)
  })

  it('rechaza título vacío', () => {
    const result = formSchema.safeParse({
      tourId: TOUR_ID,
      title: '   ',
      questions: [baseQuestion],
    })
    expect(result.success).toBe(false)
  })
})

describe('submitSchema (visitante)', () => {
  it('acepta estrellas y texto', () => {
    const result = submitSchema.safeParse({
      authorName: 'Ana',
      answers: [
        { questionId: QUESTION_1, ratingValue: 5 },
        { questionId: QUESTION_2, textValue: 'Todo excelente' },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('rechaza rating fuera de 1-5', () => {
    for (const ratingValue of [0, 6, 2.5]) {
      const result = submitSchema.safeParse({
        answers: [{ questionId: QUESTION_1, ratingValue }],
      })
      expect(result.success).toBe(false)
    }
  })

  it('acepta rating nulo con texto (pregunta opcional)', () => {
    const result = submitSchema.safeParse({
      answers: [{ questionId: QUESTION_1, ratingValue: null, textValue: 'ok' }],
    })
    expect(result.success).toBe(true)
  })

  it('rechaza texto mayor a 2000 caracteres', () => {
    const result = submitSchema.safeParse({
      answers: [{ questionId: QUESTION_1, textValue: 'x'.repeat(2001) }],
    })
    expect(result.success).toBe(false)
  })

  it('rechaza questionId que no es UUID', () => {
    const result = submitSchema.safeParse({
      answers: [{ questionId: '3', ratingValue: 4 }],
    })
    expect(result.success).toBe(false)
  })
})
