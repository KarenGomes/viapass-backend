import type { RequestHandler } from 'express'
import type { UserRole } from '../shared/types/enums'

/**
 * POLÍTICA DE ACESSO — FAIL-CLOSED
 * ================================
 * Toda rota declara explicitamente quem pode chamá-la. Não existe rota sem
 * política: uma rota pública precisa dizer que é pública, com `publicRoute()`.
 *
 * O motivo é o modo de falha que importa. Se a proteção fosse "adicione o
 * `authGuard` onde precisar", esquecer o guard produziria um endpoint aberto
 * que funciona perfeitamente em todos os testes — ninguém percebe até vazar.
 * Com política obrigatória, esquecer produz uma rota que o teste
 * `route-policy.test.ts` acusa e o build reprova.
 *
 * O marcador é uma propriedade não enumerável no próprio middleware, lida
 * depois ao percorrer a stack do Express.
 */

export const ACCESS_POLICY = Symbol.for('viapass.accessPolicy')

export type AccessPolicy =
  /** Aberta a todos. `req.user` nunca é preenchido. */
  | { kind: 'public' }
  /**
   * Aberta a todos, mas identifica quem estiver autenticado. Usada onde a
   * resposta muda para o dono do recurso — a listagem de eventos, em que o
   * organizador enxerga os próprios rascunhos e o público não.
   */
  | { kind: 'optional' }
  | { kind: 'authenticated' }
  | { kind: 'role'; roles: readonly UserRole[] }

/** Carimba a política no middleware sem alterar seu comportamento. */
export function withPolicy<T extends RequestHandler>(handler: T, policy: AccessPolicy): T {
  Object.defineProperty(handler, ACCESS_POLICY, {
    value: policy,
    enumerable: false,
    configurable: true,
  })
  return handler
}

export function readPolicy(handler: unknown): AccessPolicy | undefined {
  if (typeof handler !== 'function') return undefined

  return (handler as unknown as Record<symbol, AccessPolicy | undefined>)[ACCESS_POLICY]
}

export function describePolicy(policy: AccessPolicy): string {
  switch (policy.kind) {
    case 'public':
      return 'público'
    case 'optional':
      return 'público, identifica se autenticado'
    case 'authenticated':
      return 'autenticado'
    case 'role':
      return `papel: ${policy.roles.join(', ')}`
  }
}
