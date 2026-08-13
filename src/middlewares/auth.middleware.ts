import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { AppError } from '../shared/errors/app-error'
import { ResponseErrors } from '../shared/errors/response-errors'
import { StatusErrors } from '../shared/errors/status-errors'
import { extractBearerToken, verifyAccessToken } from '../shared/utils/jwt.util'
import type { UserRole } from '../shared/types/enums'
import { withPolicy } from './access-policy'

/**
 * Autentica pelo header `Authorization: Bearer <token>` e popula `req.user`.
 *
 * Não consulta o banco: o token já carrega id, papel e e-mail assinados. A
 * troca é deliberada — uma consulta por request custaria caro e o access token
 * dura 15 minutos, então a janela em que um papel revogado continua valendo é
 * curta e conhecida.
 */
function authenticate(req: Request): void {
  const token = extractBearerToken(req.headers.authorization)

  if (!token) {
    throw new AppError(StatusErrors.UNAUTHORIZED, ResponseErrors.TOKEN_MISSING)
  }

  const payload = verifyAccessToken(token)

  req.user = { id: payload.sub, role: payload.role, email: payload.email }
}

/** Exige usuário autenticado, sem restrição de papel. */
export const authGuard: RequestHandler = withPolicy(
  (req: Request, _res: Response, next: NextFunction) => {
    authenticate(req)
    next()
  },
  { kind: 'authenticated' },
)

/**
 * Exige autenticação **e** um dos papéis informados.
 *
 * Autentica por dentro em vez de exigir `authGuard` antes: dois middlewares
 * para uma decisão criam a chance de registrar só o segundo, e um `roleGuard`
 * sem autenticação prévia rejeitaria todo mundo — falha silenciosa na direção
 * oposta. Uma declaração por rota, sem ordem para acertar.
 */
export function roleGuard(...roles: readonly UserRole[]): RequestHandler {
  return withPolicy(
    (req: Request, _res: Response, next: NextFunction) => {
      authenticate(req)

      if (!req.user || !roles.includes(req.user.role)) {
        throw new AppError(StatusErrors.FORBIDDEN, ResponseErrors.FORBIDDEN)
      }

      next()
    },
    { kind: 'role', roles },
  )
}

/**
 * Declara a rota como intencionalmente pública.
 *
 * Não faz nada em runtime — existe para que "sem autenticação" seja uma
 * escolha registrada no código, e não a ausência de uma linha que alguém
 * esqueceu de escrever.
 */
export function publicRoute(): RequestHandler {
  return withPolicy((_req: Request, _res: Response, next: NextFunction) => next(), {
    kind: 'public',
  })
}

/**
 * Rota pública que identifica quem estiver autenticado.
 *
 * Token ausente ou inválido **não** bloqueia: apenas deixa `req.user`
 * indefinido. Serve onde a resposta muda para o dono do recurso — a listagem
 * de eventos, em que o organizador vê os próprios rascunhos.
 *
 * Engolir o erro é seguro aqui justamente porque a rota é pública: o pior caso
 * de um token inválido é o solicitante ser tratado como anônimo.
 */
export function optionalAuth(): RequestHandler {
  return withPolicy(
    (req: Request, _res: Response, next: NextFunction) => {
      try {
        authenticate(req)
      } catch {
        req.user = undefined
      }

      next()
    },
    { kind: 'optional' },
  )
}

/**
 * Lê `req.user` garantindo que o `authGuard` rodou.
 *
 * Evita o `req.user!` espalhado pelos controllers — a asserção mentiria se a
 * política da rota fosse trocada para pública sem que o controller mudasse.
 */
export function requireUser(req: Request): NonNullable<Request['user']> {
  if (!req.user) {
    throw new AppError(StatusErrors.UNAUTHORIZED, ResponseErrors.UNAUTHORIZED)
  }

  return req.user
}
