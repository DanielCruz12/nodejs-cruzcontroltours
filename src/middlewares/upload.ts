import multer from 'multer'

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024, files: 20 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/') ||
      file.mimetype === 'application/pdf'
    if (ok) return cb(null, true)
    cb(new Error('Tipo de archivo no permitido'))
  },
})

/** Upload para voz a texto del chat: un solo audio en memoria (máx. 10 MB). */
export const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype.startsWith('audio/') ||
      file.mimetype === 'video/mp4' ||
      file.mimetype === 'video/webm'
    if (ok) return cb(null, true)
    cb(new Error('Tipo de archivo no permitido'))
  },
})
