import {
  boolean,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

// Tabla de ejemplo: tours de Cruz Control Tours.
export const tours = pgTable('tours', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  durationDays: integer('duration_days').notNull().default(1),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Tour = typeof tours.$inferSelect
export type NewTour = typeof tours.$inferInsert

// Formulario de contacto: nombre, teléfono y correo requeridos.
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 200 }).notNull(),
  telefono: varchar('telefono', { length: 50 }).notNull(),
  correo: varchar('correo', { length: 255 }).notNull(),
  mensaje: text('mensaje'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert
