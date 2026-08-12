import type { Request, Response } from 'express'
import { ResponseErrors } from '../shared/errors/response-errors'
import { StatusErrors } from '../shared/errors/status-errors'

/**
 * Rota inexistente. Sem isto, o Express devolve uma página HTML de erro —
 * quebrando o cliente, que espera JSON em toda resposta.
 */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(StatusErrors.NOT_FOUND).json(ResponseErrors.ROUTE_NOT_FOUND)
}
