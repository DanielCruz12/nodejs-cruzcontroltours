# HANDOFF — Cruz Control Tours (Backend)

Contexto acumulado del proyecto para continuar el trabajo sin volver a preguntar.
**Actualiza este archivo al terminar cada sesión.**

Última actualización: 2026-11-23

## Stack

- **Express 4 + TypeScript** (CommonJS), puerto **3002**, base `/api/v1`.
- **Drizzle ORM + Postgres** (`pg`): esquema en `src/db/schema.ts`, migraciones en `drizzle/`.
- Validación con **Zod** (`src/middlewares/validate.ts`), seguridad con helmet/hpp/rate-limit, CORS configurable.
- **Auth JWT + roles** (`src/middlewares/auth.ts`): `authenticate` (Bearer) + `authorize(...roles)`. Roles: `superadmin` (todo + usuarios), `admin` (CRUD contenido), `host` (solo lectura, el backend no le abre nada extra).
- **Socket.IO** en `/socket.io` (`src/socket.ts`), **Swagger** en `/api/docs` (`src/swagger.ts`).
- Uploads de ejemplo con multer: `POST /api/v1/uploads` (campo `files`, máx. 20).
- Estructura:
  - `src/index.ts` — arranque (verifica DB con `SELECT 1`, crea servidor HTTP + Socket.IO)
  - `src/app.ts` — Express: CORS, helmet, rate-limit (`/api`), body-parser, rutas, 404, handler de errores
  - `src/routes/v1/` — `index.ts` (monta customers + tours + uploads), `customer-routes.ts`, `tour-routes.ts`, `upload-routes.ts`
  - `src/controllers/` — `customer-controller.ts`, `tour-controller.ts`, `upload-controller.ts`
  - `src/services/` — `customer-service.ts`, `tour-service.ts` (acceso a datos con Drizzle)
  - `src/db/` — `index.ts` (Pool + drizzle), `schema.ts` (barrel que re-exporta `schemas/`), `schemas/` (una tabla por archivo: `customers.ts`, `tours.ts`; las nuevas van ahí y se re-exportan en el barrel)

## Enlace con front y panel

| Consumidor | Puerto | Variable | Base |
|---|---|---|---|
| Front (`cruzcontroltours-nextjs`) | 3000 | `NEXT_PUBLIC_API_URL` | `http://localhost:3002/api/v1` |
| Panel (`panel-cruzcontroltours`) | 3001 | `NEXT_PUBLIC_API_URL` | `http://localhost:3002/api/v1` |

- `CORS_ORIGINS` en `.env.example` incluye ambos: `http://localhost:3000,http://localhost:3001`.
- Contrato JSON: éxito envuelto en `{ data }`, errores en `{ message }`; `DELETE` responde **204** sin cuerpo.
- `price` es `numeric(10,2)` en Postgres: llega como **string** (ambos consumidores ya lo saben).

## Endpoints (`/api/v1`)

- **Customers** (formulario de contacto, tabla `customers`: `id, nombre, telefono, correo, mensaje?, createdAt`):
  - `POST /customers` — público. Body: nombre/teléfono/correo requeridos, mensaje opcional máx. 2000 (`customerSchema` en `customer-routes.ts`). → 201.
  - `GET /customers` — lista ordenada por `createdAt` DESC (lo más reciente primero).
  - `GET /customers/:id` y `DELETE /customers/:id` (`id` entero ≥ 1; 404 si no existe).
- **Tours** (tabla `tours`: `id, title, description?, price, durationDays=1, active=true, createdAt`):
  - `GET /tours`, `GET /tours/:id`, `POST /tours`, `PUT /tours/:id`, `DELETE /tours/:id`.
  - `tourSchema`: title requerido, price número positivo o string numérico validado (`/^\d+(\.\d{1,2})?$/` + positivo → 400 en vez de 500 de Postgres), durationDays entero ≥ 1, active boolean.
- **Uploads**: `POST /uploads` (multer, ejemplo).

## Decisiones tomadas (NO volver a preguntar)

- `GET /customers` ordenado por fecha descendente (lo piden el panel y la bandeja `/mensajes` del front).
- `POST /customers` y `POST /reviews` son públicos (los envían los clientes sin login); los GET siguen públicos (los usa el front). Todo lo demás que escribe (POST/PUT/DELETE, uploads) exige JWT de `admin` o `superadmin`.
- Solo `superadmin` gestiona `/users` y ve `/roles`; ningún superadmin se puede editar ni borrar.
- Seed idempotente (`npm run db:seed`): crea roles + `superadmin@`/`admin@`/`host@cruzcontroltours.com` (claves por defecto `SuperAdmin123!`/`Admin123!`/`Host123!`, sobreescribibles con `SEED_*_PASSWORD`). Tablas nuevas se aplican con `dz:push` (o `dz:gen` + `dz:mig`).
- `DATABASE_URL` tiene prioridad sobre las partes `DB_*` (`src/db/index.ts`); SSL solo en producción.
- Rate-limit global: 100 req / 15 min por IP en `/api`.

## Variables de entorno (`.env.example`)

```bash
PORT=3002
NODE_ENV=development
DB_HOST / DB_PORT / DB_USERNAME / DB_PASSWORD / DB_NAME  # o DATABASE_URL (prioridad)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
JWT_SECRET=cambia-este-secreto-largo-y-aleatorio
JWT_EXPIRES_IN=12h
SEED_SUPERADMIN_PASSWORD / SEED_ADMIN_PASSWORD / SEED_HOST_PASSWORD
```

## Comandos

```bash
npm run dev    # nodemon src/index
npm run build  # rimraf dist + tsc
npm start      # node dist/index.js
npm test       # jest
npm run dz:gen # generar migración desde el schema
npm run dz:mig # aplicar migraciones
npm run dz:push / dz:studio  # push directo / UI de la DB
```

## Pendientes / recomendaciones

- Aplicar el schema (`dz:push` o `dz:gen` + `dz:mig`), definir `JWT_SECRET` real y correr `npm run db:seed`.
- `FRONTEND_URL` existe en el `.env` local pero **no se usa** en `src/` (CORS usa `CORS_ORIGINS`).
- Completar el documento Swagger (hoy solo lista GET/POST de tours y customers).

## Historial de sesiones

### 2026-11-23 — tabla y endpoints de posts (blog)

1. Nuevo `schemas/posts.ts` (`id, title, excerpt?, category?, coverImage?, content?, published=true, createdAt`) + barrel; `services/post-service.ts` (list ordenado por `createdAt` DESC), `controllers/post-controller.ts` y `routes/v1/post-routes.ts` (`GET /posts` y `GET /posts/:id` públicos; POST/PUT/DELETE solo admin/superadmin; `postSchema` exportado: title 1–200, excerpt ≤500, category ≤100, coverImage ≤2000, content ≤100000). Router registrado en `routes/v1/index.ts`.
2. Nuevo `routes/v1/post-routes.test.ts` (6 casos del schema, estilo `review-form-routes.test.ts`).
3. Migración generada y REVERTIDA (`drizzle/0001_add-posts.sql` + snapshot + entrada del journal eliminados): el usuario hace las migraciones (`dz:gen` + `dz:mig` o `dz:push` pendientes).
4. El asistente corrió jest (24/24, 3 suites, con `--cacheDirectory` local por EPERM en %TEMP% del sandbox) y `tsc --noEmit` (limpio). NOTA: el usuario corre lint/build/tsc/migraciones/tests (no volver a correrlos).

### 2026-11-22 (3) — módulo rentals (despachos)

1. Tabla `rentals` (uuid, date, time, enum `rental_status`: pending/paid/en_route/completed/cancelled default pending, customerName!, flightInfo?, pickupPlace!, destination!, driverName?, vehicle?, notes?, createdAt, updatedAt con `$onUpdate`). Rutas `GET/GET:id/POST/PUT /rentals` (sin DELETE) con `authenticate` + `authorize('superadmin','host')`; zod `rentalSchema` (fecha YYYY-MM-DD, hora HH:MM[:SS]).
2. `backend-verify.tmp.cjs`: checks N1–N5 (37/37 PASS). Migración generada `drizzle/0001_stiff_callisto.sql` (solo CREATE rentals; la aplica el usuario).

### 2026-11-22 (2) — POST /bookings para carga manual

1. Nuevo `POST /bookings` (`bookingCreateSchema` exportado: tourId uuid, departureId uuid nullish, userId string, guests int≥1, totalPrice, status opcional; `totalPriceField` compartido con el schema de update). Servicio `create` con 404 si el tour/salida no existen; controlador con manejo de `status`.
2. Auth: solo `canCreate` (superadmin/admin/host autenticados); GETs siguen públicos, PUT/DELETE siguen admin/superadmin.
3. `backend-verify.tmp.cjs`: checks B1–B4 (32/32 PASS).

### 2026-11-22 — migración de ids a UUID (todas las tablas)

1. Los 14 schemas usan `uuid().primaryKey().defaultRandom()` y FKs uuid (`bookings.userId`/`reviews.userId` siguen varchar: son ids externos). Rutas: `z.string().uuid()` en params y FKs de body; controladores sin `Number()` en ids (`sub ?? ''`, queries con `String()`); servicios/seed/JWT (`AuthPayload.sub`) a `string`. No-id intactos (guests, capacity, position, durationDays, scores, precios, page/limit).
2. Tests actualizados a UUID (`review-form-routes.test.ts`, `auth.test.ts`, `backend-verify.tmp.cjs`): jest 18/18, verify 28/28, `tsc --noEmit` limpio.
3. Migración `drizzle/0001_exotic_annihilus.sql`: la de drizzle-kit se reescribió (suelta las 15 FKs, `USING gen_random_uuid()`, `DROP DEFAULT` previo, `CREATE EXTENSION pgcrypto`, re-alta de FKs, drop de secuencias `*_id_seq`). Lleva guarda que aborta si hay datos: el usuario borra la BD y remigra desde cero.
4. Panel y front migrados a ids string en la misma sesión (ver HANDOFF del panel): tipos, slices, selects, páginas `[id]`, slug de tour del front ahora termina en UUID (`/-([0-9a-f-]{36})$/`).

### 2026-11-20 — formularios dinámicos de reseñas

1. Tablas nuevas (sin tocar las existentes): `review_forms` (tourId, ownerId, title, token único, isActive), `review_questions` (formId, label, type varchar extensible, required, position, isActive), `review_responses` (formId, bookingId?, authorName?, createdAt; se llama así porque `reviews` ya existía) y `review_answers` (reviewId, questionId, ratingValue 1-5 con check, textValue).
2. Rutas `review-form-routes.ts`: públicas `GET /review-forms/public/:token` y `POST .../submit` (rate-limit propio, valida obligatorias/rango/duplicados, guarda en transacción); gestión admin/superadmin: CRUD formularios, CRUD preguntas, `POST /:id/duplicate` (409 si el tour destino ya tiene formulario activo, con `existingForm`; `deactivateExisting: true` lo desactiva y continúa), `GET /review-responses` y `GET /review-forms/:id/reviews` (paginado + filtros + promedios por pregunta).
3. Reglas: preguntas/formularios con respuestas se desactivan, no se borran; tipo de pregunta con respuestas no se cambia. Test de zod `review-form-routes.test.ts` (10 casos).
4. Aplicar con `dz:push` (o `dz:gen` + `dz:mig`).

### 2026-11-19 — auth JWT + roles (users/roles) y rutas protegidas

1. Nuevas tablas `roles` y `users` (`schemas/roles.ts`, `schemas/users.ts` + barrel): rol por FK, email único, hash bcrypt, `active`, timestamps.
2. `middlewares/auth.ts` (`authenticate` + `authorize`), servicios/controladores/rutas de `auth` (`POST /auth/login` con rate-limit propio, `GET /auth/me`), `users` (CRUD superadmin) y `roles` (lista superadmin). Usuarios nunca exponen el hash; no se puede borrar el último superadmin.
3. Escritura protegida en las 9 rutas (POST/PUT/DELETE + uploads → admin/superadmin); `POST /customers`, `POST /reviews` y todos los GET siguen públicos para el front.
4. `db/seed.ts` idempotente + script `db:seed`; `.env.example` con `JWT_SECRET`, `JWT_EXPIRES_IN` y `SEED_*_PASSWORD`.
5. Test `middlewares/auth.test.ts` (7/7 PASS con jest + `jest.config.js` nuevo; correr con caché local por EPERM en %TEMP% del sandbox).

### 2026-11-18 (5) — uploads reales a S3

1. `POST /uploads` (campo `files`, máx. 20) ya persiste: nuevo `services/storage-service.ts` sube cada archivo a S3 (`S3_BUCKET`, `S3_REGION`, `S3_PREFIX`, credenciales vía SDK chain) con key `uuid-nombre` y devuelve `{ name, type, size, url, key }`. El bucket debe permitir lecturas públicas.
2. `.env.example` documenta las 5 variables. Sin verificación (el usuario pidió no correr tests/tsc/checks/builds).

### 2026-11-18 (4) — protocols.tourId, fuera tours.protocolId

1. La relación tour↔protocolo vive ahora solo en `protocols.tourId` (NOT NULL, cascade): mantener ambos FKs rompía tsc (TS7022/TS7024 por inferencia circular). Borrado `tours.protocolId` (schema + zod). `POST /protocols` exige `tourId` y 404 si el tour no existe; `PUT` lo acepta opcional.
2. Generada (NO aplicada) `drizzle/0001_burly_silhouette.sql`: drop FK + columna `tours.protocol_id`, add `protocols.tour_id` NOT NULL + FK cascade. El usuario aplica con `dz:mig`. Falla si `protocols` ya tiene filas (backfill primero).
3. `backend-verify.tmp.cjs` 27/27 (nuevos P1–P4 de protocolos); `tsc --noEmit` limpio.

### 2026-11-18 — schema separado por tabla

1. `src/db/schema.ts` dividido en `src/db/schemas/customers.ts` y `src/db/schemas/tours.ts` (tabla + tipos `X`/`NewX` en cada archivo); `schema.ts` quedó como barrel (`export *`) para que servicios, `db/index.ts` y drizzle-kit (`schema: './src/db/schema.ts'`) sigan igual, sin cambios.
2. Convención: cada tabla nueva va en su archivo en `schemas/` y se re-exporta en el barrel.
3. ⚠️ No se corrió tsc, build, tests ni migraciones (el usuario lo hace). Verificación solo por lectura.

### 2026-11-17 — página de estado del backend

1. Nuevo `GET /health` en `src/app.ts`: responde `{ status, database, uptime, environment, version, timestamp }`; si la DB cae responde `degraded` en vez de 500.
2. `public/index.html` rediseñado como panel de estado en vivo (consulta `/health` cada 15 s) + `public/styles.css` y `public/status.js` separados (compatibles con el CSP de helmet en producción).
3. Verificado con `tsc --noEmit` y prueba del handler `/health` (sin DB: `degraded`, correcto). No se corrió el servidor ni migraciones.

### 2026-11-17 — enlace con front y panel

1. `customer-service.ts`: `list()` ahora ordena por `createdAt` DESC (panel y bandeja del front muestran lo más reciente primero).
2. `.env.example`: comentario que documenta qué puerto es cada consumidor (3000 front, 3001 panel).
3. Sin cambios de endpoints: el front (`lib/api/`) y el panel nuevo (`src/lib/api-client.ts` + `src/services/customer-service.ts`) consumen el contrato `{ data }` existente.
4. Otra sesión en paralelo aportó la validación de `price` como string numérico en `tourSchema` y corrigió los scripts `db:generate`/`db:migrate` del `README.md` a `dz:gen`/`dz:mig`.
5. ⚠️ No se corrió tsc, build, tests ni migraciones (el usuario lo hace). Verificación solo por lectura.
6. Creado este `HANDOFF.md`.
