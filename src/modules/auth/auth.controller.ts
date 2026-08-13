import type { Request, Response } from 'express'
import { StatusErrors } from '../../shared/errors/status-errors'
import { AppError } from '../../shared/errors/app-error'
import { ResponseErrors } from '../../shared/errors/response-errors'
import { env } from '../../config/env'
import type { AuthResult, AuthService } from './auth.service'
import type { LoginDTO, RefreshDTO, RegisterDTO } from './auth.dto'

const REFRESH_COOKIE = 'viapass_refresh'

export class AuthController {
  constructor(private readonly service: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.register(req.body as RegisterDTO)

    this.sendTokens(res, result, StatusErrors.CREATED)
  }

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.login(req.body as LoginDTO)

    this.sendTokens(res, result, StatusErrors.OK)
  }

  /**
   * Aceita o refresh token pelo cookie ou pelo corpo.
   *
   * O cookie é o caminho seguro no navegador (HttpOnly, fora do alcance do
   * JavaScript). O corpo existe para clientes que não têm cookie — o Swagger
   * UI, curl e um app nativo no futuro.
   */
  refresh = async (req: Request, res: Response): Promise<void> => {
    const cookies = req.headers.cookie
    const fromCookie = cookies
      ?.split(';')
      .map((part) => part.trim().split('='))
      .find(([name]) => name === REFRESH_COOKIE)?.[1]

    const token = fromCookie ?? (req.body as RefreshDTO).refreshToken

    if (!token) {
      throw new AppError(StatusErrors.UNAUTHORIZED, ResponseErrors.TOKEN_MISSING)
    }

    const result = await this.service.refresh(decodeURIComponent(token))

    this.sendTokens(res, result, StatusErrors.OK)
  }

  logout = (_req: Request, res: Response): void => {
    res.clearCookie(REFRESH_COOKIE, this.cookieOptions())
    res.status(StatusErrors.NO_CONTENT).send()
  }

  private sendTokens(res: Response, result: AuthResult, status: number): void {
    res.cookie(REFRESH_COOKIE, result.refreshToken, this.cookieOptions())

    // O refresh também vai no corpo para clientes sem cookie. Em produção,
    // o front deve usar o cookie e ignorar este campo.
    res.status(status).json(result)
  }

  private cookieOptions() {
    return {
      httpOnly: true,
      secure: env.isProduction,
      /**
       * `lax`, não `strict`.
       *
       * O MER §5.1 pedia `strict`, que funciona em desenvolvimento apenas por
       * acidente: `localhost:5173` e `localhost:3001` são o mesmo site, então
       * o cookie viaja. Em produção, com front e API em domínios diferentes,
       * `strict` bloquearia o cookie e o refresh nunca funcionaria.
       *
       * `lax` mantém a proteção contra CSRF nas requisições que importam
       * (POST cross-site não leva o cookie) e permite o fluxo real.
       */
      sameSite: 'lax' as const,
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }
  }
}
