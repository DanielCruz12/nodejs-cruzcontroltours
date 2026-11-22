import { formSchema, submitSchema } from './review-form-routes'

describe('formSchema (creador)', () => {
  const baseQuestion = {
    label: '¿Cómo calificarías el tour?',
    type: 'stars',
    required: true,
  }

  it('acepta un formulario válido', () => {
    const result = formSchema.safeParse({
      tourId: 1,
      title: 'Encuesta post-tour',
      questions: [baseQuestion],
    })
    expect(result.success).toBe(true)
  })

  it('rechaza sin preguntas', () => {
    const result = formSchema.safeParse({
      tourId: 1,
      title: 'Vacío',
      questions: [],
    })
    expect(result.success).toBe(false)
  })

  it('rechaza más de 30 preguntas', () => {
    const result = formSchema.safeParse({
      tourId: 1,
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
      tourId: 1,
      title: 'Raro',
      questions: [{ ...baseQuestion, type: 'video' }],
    })
    expect(result.success).toBe(false)
  })

  it('rechaza título vacío', () => {
    const result = formSchema.safeParse({
      tourId: 1,
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
        { questionId: 1, ratingValue: 5 },
        { questionId: 2, textValue: 'Todo excelente' },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('rechaza rating fuera de 1-5', () => {
    for (const ratingValue of [0, 6, 2.5]) {
      const result = submitSchema.safeParse({
        answers: [{ questionId: 1, ratingValue }],
      })
      expect(result.success).toBe(false)
    }
  })

  it('acepta rating nulo con texto (pregunta opcional)', () => {
    const result = submitSchema.safeParse({
      answers: [{ questionId: 1, ratingValue: null, textValue: 'ok' }],
    })
    expect(result.success).toBe(true)
  })

  it('rechaza texto mayor a 2000 caracteres', () => {
    const result = submitSchema.safeParse({
      answers: [{ questionId: 1, textValue: 'x'.repeat(2001) }],
    })
    expect(result.success).toBe(false)
  })

  it('convierte questionId string a número', () => {
    const result = submitSchema.safeParse({
      answers: [{ questionId: '3', ratingValue: 4 }],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.answers[0].questionId).toBe(3)
    }
  })
})
