import { describeRoutes } from './route-audit'
import { UserRole } from '../shared/types/enums'
import type { RouteModule } from '../api-routes'

/**
 * FAIL-CLOSED — toda rota declara quem pode chamá-la
 * ==================================================
 * Este é o teste que sustenta a regra "todos os endpoints passam pelo
 * middleware de acesso".
 *
 * Sem ele, esquecer o guard produziria um endpoint aberto que funciona
 * perfeitamente em qualquer outro teste — ninguém percebe até vazar. Com ele,
 * esquecer é falha de build.
 */

jest.mock('../config/database', () => {
   
  const { createDataSourceMock } = require('../test/data-source.mock') as {
    createDataSourceMock: () => unknown
  }

  return { AppDataSource: createDataSourceMock() }
})

// `require` e não `import`: o mock acima precisa estar aplicado antes de os
// módulos de rota resolverem seus repositórios, e imports são içados.
 
const { API_ROUTES } = require('../api-routes') as { API_ROUTES: RouteModule[] }

const routes = describeRoutes(API_ROUTES)

/**
 * Matriz de permissões esperada (MER §5.2), declarada aqui de forma
 * independente do código de produção. Se alguém trocar o papel de um endpoint,
 * o teste acusa a divergência em vez de aceitar em silêncio.
 */
const EXPECTED: Record<string, string> = {
  'GET /api/health': 'public',
  'POST /api/auth/register': 'public',
  'POST /api/auth/login': 'public',
  'POST /api/auth/refresh': 'public',
  'POST /api/auth/logout': 'authenticated',
  'GET /api/users/me': 'authenticated',
  'PUT /api/users/me': 'authenticated',
  'DELETE /api/users/me': 'authenticated',
  'GET /api/catalog/search': 'role:organizer',
  'GET /api/catalog/events/:tmId': 'role:organizer',
  'GET /api/events': 'optional',
  'GET /api/events/:id': 'optional',
  'GET /api/events/:id/seats': 'public',
  'POST /api/events': 'role:organizer',
  'POST /api/events/import': 'role:organizer',
  'PUT /api/events/:id': 'role:organizer',
  'DELETE /api/events/:id': 'role:organizer',
  'POST /api/events/:id/publish': 'role:organizer',
  'POST /api/events/:id/cancel': 'role:organizer',
  'POST /api/orders': 'role:client',
  'GET /api/orders/my': 'role:client',
  'GET /api/orders/:id': 'role:client',
  'POST /api/orders/:id/pay': 'role:client',
  'POST /api/orders/:id/cancel': 'role:client',
  'GET /api/tickets/my': 'role:client',
  'GET /api/tickets/:id': 'role:client',
  'POST /api/tickets/:id/share': 'role:client',
  'GET /api/tickets/shares/:token': 'public',
  'POST /api/tickets/claim/:token': 'role:client',
  'POST /api/gate/validate': 'role:gate',
  'GET /api/gate/tickets/:ticketId/history': 'role:gate',
}

function describePolicyKind(route: (typeof routes)[number]): string {
  const [policy] = route.policies

  if (!policy) return 'NENHUMA'

  return policy.kind === 'role' ? `role:${policy.roles.join('+')}` : policy.kind
}

describe('política de acesso das rotas', () => {
  it('encontra rotas registradas — se falhar, a auditoria quebrou, não a app', () => {
    expect(routes.length).toBeGreaterThan(20)
  })

  it('nenhuma rota fica sem política declarada', () => {
    const unprotected = routes
      .filter((route) => route.policies.length === 0)
      .map((route) => `${route.method} ${route.path}`)

    expect(unprotected).toEqual([])
  })

  it('nenhuma rota declara duas políticas conflitantes', () => {
    const ambiguous = routes
      .filter((route) => route.policies.length > 1)
      .map((route) => `${route.method} ${route.path} → ${route.policies.length} políticas`)

    expect(ambiguous).toEqual([])
  })

  it('a matriz de permissões bate com o MER §5.2', () => {
    const actual = Object.fromEntries(
      routes.map((route) => [`${route.method} ${route.path}`, describePolicyKind(route)]),
    )

    expect(actual).toEqual(EXPECTED)
  })

  it('toda rota da matriz existe de fato na aplicação', () => {
    const registered = new Set(routes.map((route) => `${route.method} ${route.path}`))
    const missing = Object.keys(EXPECTED).filter((key) => !registered.has(key))

    expect(missing).toEqual([])
  })

  describe('regras de negócio da matriz', () => {
    const policyOf = (key: string) =>
      routes.find((route) => `${route.method} ${route.path}` === key)?.policies[0]

    it('só o organizador toca no catálogo externo e na gestão de eventos', () => {
      for (const key of [
        'GET /api/catalog/search',
        'POST /api/events',
        'POST /api/events/import',
        'PUT /api/events/:id',
        'POST /api/events/:id/publish',
      ]) {
        const policy = policyOf(key)

        expect(policy?.kind).toBe('role')
        expect(policy?.kind === 'role' && policy.roles).toEqual([UserRole.ORGANIZER])
      }
    })

    it('só o cliente compra, e só a portaria valida', () => {
      const checkout = policyOf('POST /api/orders')
      const gate = policyOf('POST /api/gate/validate')

      expect(checkout?.kind === 'role' && checkout.roles).toEqual([UserRole.CLIENT])
      expect(gate?.kind === 'role' && gate.roles).toEqual([UserRole.GATE])
    })

    it('a navegação pelos eventos publicados não exige login', () => {
      expect(policyOf('GET /api/events')?.kind).toBe('optional')
      expect(policyOf('GET /api/events/:id')?.kind).toBe('optional')
    })

    it('as rotas públicas são exatamente as esperadas — nada entra sem revisão', () => {
      const publicRoutes = routes
        .filter((route) => route.policies[0]?.kind === 'public')
        .map((route) => `${route.method} ${route.path}`)
        .sort()

      expect(publicRoutes).toEqual([
        'GET /api/events/:id/seats',
        'GET /api/health',
        'GET /api/tickets/shares/:token',
        'POST /api/auth/login',
        'POST /api/auth/refresh',
        'POST /api/auth/register',
      ])
    })
  })
})
