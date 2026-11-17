import type { Express } from 'express'
import swaggerUi from 'swagger-ui-express'

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Cruz Control Tours API',
    version: '1.0.0',
    description: 'API v1 de Cruz Control Tours',
  },
  paths: {
    '/api/v1/tours': {
      get: {
        summary: 'Listar tours',
        responses: { '200': { description: 'Lista de tours' } },
      },
      post: {
        summary: 'Crear tour',
        responses: { '201': { description: 'Tour creado' } },
      },
    },
  },
}

export function setupSwagger(app: Express) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
}
