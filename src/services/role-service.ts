import { db } from '../db/db'
import { Role, roles } from '../db/schemas'

export const roleService = {
  async list(): Promise<Role[]> {
    return db.select().from(roles).orderBy(roles.id)
  },
}
