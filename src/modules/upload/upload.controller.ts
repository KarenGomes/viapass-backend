import type { Request, Response } from 'express'
import { AppError } from '../../shared/errors/app-error'
import { StatusErrors } from '../../shared/errors/status-errors'

export class UploadController {
  uploadImage = async (req: Request, res: Response): Promise<void> => {
    // req.file é adicionado pelo middleware `multer`
    if (!req.file) {
      throw new AppError(StatusErrors.BAD_REQUEST, { msg: 'Nenhum arquivo enviado' })
    }

    /**
     * Caminho relativo, servido por `express.static` em `/uploads` (ver
     * `app.ts`). Devolver URL absoluta gravaria o host no banco, e toda
     * imagem quebraria assim que a API mudasse de domínio ou porta — quem
     * resolve o endereço final é o cliente, que sabe onde a API está.
     */
    const url = `/uploads/${req.file.filename}`

    res.status(200).json({ url })
  }
}
