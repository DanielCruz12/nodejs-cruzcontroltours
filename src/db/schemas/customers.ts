import { date, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

// Formulario de contacto: nombre, teléfono y correo requeridos.
// Teléfono secundario y fecha de nacimiento son opcionales.
export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: varchar('nombre', { length: 200 }).notNull(),
  telefono: varchar('telefono', { length: 50 }).notNull(),
  telefonoSecundario: varchar('telefono_secundario', { length: 50 }),
  fechaNacimiento: date('fecha_nacimiento'),
  correo: varchar('correo', { length: 255 }).notNull(),
  mensaje: text('mensaje'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert
