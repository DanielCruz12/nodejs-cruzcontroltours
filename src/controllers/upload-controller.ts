import { Request, Response } from 'express'
import { storageService } from '../services/storage-service'

export async function uploadFiles(req: Request, res: Response) {
  try {
    const files = (req.files as Express.Multer.File[]) ?? []
    const data = await Promise.all(
      files.map((file) => storageService.upload(file)),
    )
    res.status(201).json({ data })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Upload failed',
    })
  }
}
