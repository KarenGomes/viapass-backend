import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import { roleGuard } from '../../middlewares/auth.middleware'
import { UserRole } from '../../shared/types/enums'
import { UploadController } from './upload.controller'

const router = Router()
const controller = new UploadController()

// Garante que a pasta public/uploads existe
const uploadDir = path.join(process.cwd(), 'public', 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configuração do multer para salvar em public/uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    const uniqueName = `${uuidv4()}${ext}`
    cb(null, uniqueName)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Apenas imagens são permitidas'))
    }
  },
})

/**
 * @openapi
 * /upload/image:
 *   post:
 *     tags: [Upload]
 *     summary: Faz o upload de uma imagem
 *     description: Aceita apenas arquivos de imagem (até 5MB). Requer autenticação de organizador.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload realizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url: { type: string, example: "/uploads/abcd-1234.jpg" }
 *       400: { $ref: '#/components/responses/BadRequest' }
 */
router.post(
  '/image',
  roleGuard(UserRole.ORGANIZER),
  upload.single('file'),
  controller.uploadImage,
)

export default router
