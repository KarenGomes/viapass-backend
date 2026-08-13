import type { UserRole } from './enums'

/**
 * Identidade do usuário autenticado, extraída do access token.
 *
 * É só o que o token carrega — sem consulta ao banco. Quem precisar do
 * usuário completo busca pelo `id`; a maioria das autorizações só precisa
 * de `id` e `role`.
 */
export interface AuthenticatedUser {
  id: string
  role: UserRole
  email: string
}

declare global {
   
  namespace Express {
    interface Request {
      /**
       * Preenchido pelo `authGuard`. Indefinido em rota pública — por isso é
       * opcional: o tipo obriga a checar antes de usar, em vez de confiar que
       * o middleware rodou.
       */
      user?: AuthenticatedUser
    }
  }
}

export {}
