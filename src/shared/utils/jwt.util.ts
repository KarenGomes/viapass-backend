import jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'
import { env } from '../../config/env'
import { AppError } from '../errors/app-error'
import { ResponseErrors } from '../errors/response-errors'
import { StatusErrors } from '../errors/status-errors'
import type { UserRole } from '../types/enums'

/**
 * Emissão e verificação de JWT.
 *
 * Access e refresh usam segredos **diferentes**. Com o mesmo segredo, um
 * refresh token roubado passaria como access token — e ele vale 7 dias contra
 * 15 minutos do access.
 */

export interface AccessTokenPayload {
  sub: string
  role: UserRole
  email: string
}

export interface RefreshTokenPayload {
  sub: string
  /** Diferencia o refresh do access mesmo se os segredos forem trocados por engano. */
  type: 'refresh'
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

const ISSUER = 'viapass-api'

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: ISSUER,
  } as SignOptions)
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    issuer: ISSUER,
  } as SignOptions)
}

export function signTokenPair(payload: AccessTokenPayload): TokenPair {
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload.sub),
  }
}

/**
 * Converte a falha do `jsonwebtoken` em `AppError` com mensagem própria.
 *
 * Token expirado e token adulterado recebem mensagens distintas de propósito:
 * o primeiro é caso normal e o cliente deve renovar; o segundo exige novo
 * login. Sem a distinção, o front não sabe qual caminho seguir.
 */
function verify<T>(token: string, secret: string): T {
  try {
    return jwt.verify(token, secret, { issuer: ISSUER }) as T
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(StatusErrors.UNAUTHORIZED, ResponseErrors.TOKEN_EXPIRED)
    }
    throw new AppError(StatusErrors.UNAUTHORIZED, ResponseErrors.TOKEN_INVALID)
  }
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return verify<AccessTokenPayload>(token, env.JWT_SECRET)
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = verify<RefreshTokenPayload>(token, env.JWT_REFRESH_SECRET)

  if (payload.type !== 'refresh') {
    throw new AppError(StatusErrors.UNAUTHORIZED, ResponseErrors.TOKEN_INVALID)
  }

  return payload
}

/** Extrai o token de `Authorization: Bearer <token>`. */
export function extractBearerToken(header: string | undefined): string | null {
  if (!header) return null

  const [scheme, token] = header.split(' ')

  if (scheme?.toLowerCase() !== 'bearer' || !token) return null

  return token
}
