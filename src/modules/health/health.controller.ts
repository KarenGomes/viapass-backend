import type { Request, Response } from 'express'
import { StatusErrors } from '../../shared/errors/status-errors'
import type { HealthService } from './health.service'

export class HealthController {
  constructor(private readonly service: HealthService) {}

  /**
   * Devolve 503 quando o banco está fora, e não 200 com `status: degraded`.
   * Orquestrador e load balancer decidem pelo código HTTP, não pelo corpo.
   */
  check = async (_req: Request, res: Response): Promise<void> => {
    const report = await this.service.check()
    const httpStatus =
      report.status === 'ok' ? StatusErrors.OK : StatusErrors.SERVICE_UNAVAILABLE

    res.status(httpStatus).json(report)
  }
}
