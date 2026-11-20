import { Request, Response } from 'express'
import { roleService } from '../services/role-service'

export const roleController = {
  async list(_req: Request, res: Response) {
    const data = await roleService.list()
    res.json({ data })
  },
}
