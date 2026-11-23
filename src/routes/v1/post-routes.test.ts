import { postSchema } from './post-routes'

describe('postSchema (blog)', () => {
  it('acepta un artículo válido', () => {
    const result = postSchema.safeParse({
      title: 'Guía para subir el volcán de Santa Ana',
      excerpt: 'Todo lo que debes saber antes de conquistar el Ilamatepec.',
      category: 'Volcanes',
      coverImage: 'https://example.com/portada.jpg',
      content: '<p>El Ilamatepec es el coloso más alto…</p>',
      published: true,
    })
    expect(result.success).toBe(true)
  })

  it('acepta solo el título (resto opcional)', () => {
    const result = postSchema.safeParse({ title: 'Borrador' })
    expect(result.success).toBe(true)
  })

  it('rechaza título vacío', () => {
    const result = postSchema.safeParse({ title: '   ' })
    expect(result.success).toBe(false)
  })

  it('rechaza título mayor a 200 caracteres', () => {
    const result = postSchema.safeParse({ title: 'x'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('rechaza extracto mayor a 500 caracteres', () => {
    const result = postSchema.safeParse({
      title: 'Válido',
      excerpt: 'x'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it('rechaza categoría mayor a 100 caracteres', () => {
    const result = postSchema.safeParse({
      title: 'Válido',
      category: 'x'.repeat(101),
    })
    expect(result.success).toBe(false)
  })
})
