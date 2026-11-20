import { db } from '../db'
import { Role, roles } from '../db/schema'

export const roleService = {
  async list(): Promise<Role[]> {
    return db.select().from(roles).orderBy(roles.id)
  },
}
