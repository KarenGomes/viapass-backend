import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../shared/errors/app-error'
import { ResponseErrors } from '../shared/errors/response-errors'
import { StatusErrors } from '../shared/errors/status-errors'
import { env } from '../config/env'

/**
 * Tratador de erros global — último middleware da cadeia.
 *
 * Divide o mundo em dois:
 *  · `AppError` — falha esperada. A mensagem foi escrita para o usuário final
 *    e vai inteira na resposta.
 *  · Qualquer outra coisa — falha inesperada. Vira 500 com mensagem genérica,
 *    e o erro original só aparece no log do servidor. Detalhe de stack, nome
 *    de coluna e string de conexão nunca chegam ao cliente.
 */
export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  // O Express só reconhece um error handler se ele declarar quatro parâmetros.
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json(error.body)
    return
  }

  if (!env.isTest) {
    console.error('[erro não tratado]', error)
  }

  res.status(StatusErrors.INTERNAL).json(ResponseErrors.INTERNAL_ERROR)
}
