import rateLimit from 'express-rate-limit'
import { ResponseErrors } from '../shared/errors/response-errors'
import { StatusErrors } from '../shared/errors/status-errors'
import { env } from '../config/env'

/** Limite geral da API. Desligado em teste para não interferir na suíte. */
export const apiRateLimiter = rateLimit({
  windowMs: 60_000,
  limit: env.isTest ? 0 : 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: ResponseErrors.TOO_MANY_REQUESTS,
  statusCode: StatusErrors.TOO_MANY_REQUESTS,
  skip: () => env.isTest,
})

/**
 * Limite estrito para autenticação. Login é onde se tenta força bruta, e o
 * custo do bcrypt torna cada tentativa cara para o servidor.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: env.isTest ? 0 : 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: ResponseErrors.TOO_MANY_REQUESTS,
  statusCode: StatusErrors.TOO_MANY_REQUESTS,
  skipSuccessfulRequests: true,
  skip: () => env.isTest,
})
