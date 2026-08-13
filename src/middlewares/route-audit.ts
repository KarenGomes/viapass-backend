import type { Router } from 'express'
import { readPolicy, type AccessPolicy } from './access-policy'
import type { RouteModule } from '../api-routes'

export interface RouteDescription {
  method: string
  path: string
  policies: AccessPolicy[]
}

/**
 * Lista a política de acesso declarada em cada rota da API.
 *
 * Serve ao teste que garante o fail-closed: rota sem política é rota que
 * alguém registrou sem decidir quem pode chamá-la, e o teste reprova. Também
 * dá uma listagem legível para revisar a matriz de permissões de uma vez.
 *
 * O caminho de montagem vem do registro em `api-routes.ts`, não da stack
 * interna do Express — que mudou de formato entre a versão 4 e a 5 e não é
 * base confiável para uma verificação de segurança.
 */
export function describeRoutes(modules: RouteModule[]): RouteDescription[] {
  const routes = modules.flatMap((module) => describeRouter(module.router, module.prefix))

  return routes.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method))
}

interface RouteLayer {
  route?: {
    path?: string
    methods?: Record<string, boolean>
    stack?: Array<{ handle?: unknown }>
  }
}

function describeRouter(router: Router, prefix: string): RouteDescription[] {
  const stack = (router as unknown as { stack?: RouteLayer[] }).stack ?? []
  const routes: RouteDescription[] = []

  for (const layer of stack) {
    if (!layer.route) continue

    // Rota na raiz do router vira só o prefixo, sem barra sobrando.
    const suffix = layer.route.path === '/' ? '' : (layer.route.path ?? '')
    const path = `${prefix}${suffix}` || '/'

    const policies = (layer.route.stack ?? [])
      .map((handler) => readPolicy(handler.handle))
      .filter((policy): policy is AccessPolicy => policy !== undefined)

    const methods = Object.entries(layer.route.methods ?? {})
      .filter(([, enabled]) => enabled)
      .map(([method]) => method.toUpperCase())

    for (const method of methods) {
      routes.push({ method, path, policies })
    }
  }

  return routes
}
