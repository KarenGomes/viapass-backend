import type { Request, Response } from 'express'
import { StatusErrors } from '../../shared/errors/status-errors'
import { requireUser } from '../../middlewares/auth.middleware'
import type { GateService } from './gate.service'
import type { ValidateTicketDTO } from './gate.dto'

export class GateController {
  constructor(private readonly service: GateService) {}

  /**
   * Sempre 200 — inclusive quando o ingresso é recusado. O veredito está no
   * corpo, em `result`; ver a justificativa no `GateService`.
   */
  validate = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req)
    const result = await this.service.validate(req.body as ValidateTicketDTO, id)

    res.status(StatusErrors.OK).json(result)
  }

  history = async (req: Request, res: Response): Promise<void> => {
    const validations = await this.service.history(req.params.ticketId as string)

    res.status(StatusErrors.OK).json(
      validations.map((validation) => ({
        id: validation.id,
        result: validation.result,
        validatedAt: validation.validatedAt,
        validatedBy: validation.validatedBy
          ? { id: validation.validatedBy.id, name: validation.validatedBy.name }
          : null,
      })),
    )
  }
}
