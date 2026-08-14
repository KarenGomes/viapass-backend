import type { Router } from 'express'
import { API_PREFIX } from './shared/constants'

import authRoutes from './modules/auth/auth.routes'
import catalogRoutes from './modules/catalog/catalog.routes'
import eventRoutes from './modules/events/event.routes'
import gateRoutes from './modules/gate/gate.routes'
import healthRoutes from './modules/health/health.routes'
import orderRoutes from './modules/orders/order.routes'
import ticketRoutes from './modules/tickets/ticket.routes'
import userRoutes from './modules/users/user.routes'

export interface RouteModule {
  prefix: string
  router: Router
}

/**
 * Registro central dos módulos de rota.
 *
 * Existe como lista de dados — e não como uma sequência de `app.use(...)` —
 * porque duas coisas precisam dela: o `app.ts`, para montar, e a auditoria de
 * políticas de acesso, para saber o caminho completo de cada rota.
 *
 * A alternativa era ler o caminho de montagem da stack interna do Express.
 * Funcionava na versão 4, que guardava uma `RegExp` por layer; a 5 substituiu
 * isso por `matchers` e não guarda mais o texto do caminho. Depender de
 * interno de framework para uma verificação de segurança é frágil demais —
 * este registro é a fonte de verdade, e não quebra em upgrade.
 */
import uploadRoutes from './modules/upload/upload.routes'

export const API_ROUTES: RouteModule[] = [
  { prefix: `${API_PREFIX}/health`, router: healthRoutes },
  { prefix: `${API_PREFIX}/auth`, router: authRoutes },
  { prefix: `${API_PREFIX}/users`, router: userRoutes },
  { prefix: `${API_PREFIX}/catalog`, router: catalogRoutes },
  { prefix: `${API_PREFIX}/events`, router: eventRoutes },
  { prefix: `${API_PREFIX}/orders`, router: orderRoutes },
  { prefix: `${API_PREFIX}/tickets`, router: ticketRoutes },
  { prefix: `${API_PREFIX}/gate`, router: gateRoutes },
  { prefix: `${API_PREFIX}/upload`, router: uploadRoutes },
]
