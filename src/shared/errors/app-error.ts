import type { ErrorBody } from './response-errors'

/**
 * Exceção esperada da aplicação — a que o error handler traduz em resposta HTTP.
 *
 * Qualquer erro que NÃO seja um `AppError` é tratado como falha inesperada:
 * vira 500 e tem a mensagem original omitida da resposta, para não vazar
 * detalhe de implementação ou de banco para o cliente.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly body: ErrorBody,
  ) {
    super(body.msg)
    this.name = 'AppError'

    // Sem isto, `instanceof AppError` falha ao estender Error em ES5/ES2022.
    Object.setPrototypeOf(this, AppError.prototype)
  }
}
