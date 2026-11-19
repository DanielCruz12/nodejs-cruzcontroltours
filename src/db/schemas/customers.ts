import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'

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
