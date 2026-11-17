# Cruz Control Tours — Backend (Node.js)

Backend simple en Express + TypeScript + Drizzle + PostgreSQL.

## Estructura

```text
src/
├── index.ts            # Entry point: DB check + HTTP + Socket.IO
├── app.ts              # Express: seguridad, CORS, rate limit, rutas
├── socket.ts           # initSocket()
├── swagger.ts          # Docs en /api/docs
├── db/
│   ├── index.ts        # drizzle + pg Pool
│   └── schema.ts       # Tablas (tours)
├── routes/v1/          # index.ts agrega tours, uploads
├── controllers/        # req/res, sin lógica de negocio
├── services/           # Lógica + acceso a datos (drizzle)
└── middlewares/        # upload (multer), validate
```

## Uso

```powershell
Copy-Item .env.example .env
npm install
npm run db:generate   # genera la migración
npm run db:migrate    # la aplica
npm run dev           # http://localhost:3002
```

## Endpoints

| Método | Ruta              |
| ------ | ----------------- |
| GET    | /api/v1/tours     |
| GET    | /api/v1/tours/:id |
| POST   | /api/v1/tours     |
| PUT    | /api/v1/tours/:id |
| DELETE | /api/v1/tours/:id |
| POST   | /api/v1/uploads   |
| POST   | /api/v1/customers |
| GET    | /api/v1/customers |
| GET    | /api/v1/customers/:id |
| DELETE | /api/v1/customers/:id |

Docs Swagger: `/api/docs` · Socket.IO: `/socket.io`
