import { Request, Response } from 'express'

/** Ejemplo de subida con multer (archivos en memoria, no se guardan). */
export function uploadFiles(req: Request, res: Response) {
  const files = (req.files as Express.Multer.File[]) ?? []
  res.status(201).json({
    data: files.map((f) => ({
      name: f.originalname,
      type: f.mimetype,
      size: f.size,
    })),
  })
}
