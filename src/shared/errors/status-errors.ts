/**
 * Códigos HTTP usados pela aplicação.
 *
 * Existe para que nenhum número solto apareça nos services. `throw new
 * AppError(404, ...)` esconde a intenção; `StatusErrors.NOT_FOUND` não.
 */
export class StatusErrors {
  static readonly OK = 200
  static readonly CREATED = 201
  static readonly NO_CONTENT = 204

  static readonly BAD_REQUEST = 400
  static readonly UNAUTHORIZED = 401
  static readonly FORBIDDEN = 403
  static readonly NOT_FOUND = 404
  static readonly CONFLICT = 409
  static readonly UNPROCESSABLE = 422
  static readonly TOO_MANY_REQUESTS = 429

  static readonly INTERNAL = 500
  static readonly BAD_GATEWAY = 502
  static readonly SERVICE_UNAVAILABLE = 503
}
