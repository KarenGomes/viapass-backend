import type { Request, Response } from 'express'
import { StatusErrors } from '../../shared/errors/status-errors'
import type { CatalogService } from './catalog.service'

/** Lê um parâmetro de query como string, ignorando arrays e objetos. */
function queryString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined
}

function queryInt(value: unknown): number | undefined {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined
}

export class CatalogController {
  constructor(private readonly service: CatalogService) {}

  search = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.search({
      keyword: queryString(req.query.keyword),
      city: queryString(req.query.city),
      countryCode: queryString(req.query.countryCode),
      classificationName: queryString(req.query.classificationName),
      startDateTime: queryString(req.query.startDateTime),
      endDateTime: queryString(req.query.endDateTime),
      page: queryInt(req.query.page),
      size: queryInt(req.query.size),
    })

    res.status(StatusErrors.OK).json(result)
  }

  getEvent = async (req: Request, res: Response): Promise<void> => {
    res.status(StatusErrors.OK).json(await this.service.getEvent(req.params.tmId as string))
  }
}
