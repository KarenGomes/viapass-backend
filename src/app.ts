import path from 'node:path'

import express from 'express'
import type { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'

import { corsOptions } from './config/cors'
import { swaggerSpec } from './config/swagger'
import { apiRateLimiter } from './middlewares/rate-limit.middleware'
import { errorHandler } from './middlewares/error-handler.middleware'
import { notFoundHandler } from './middlewares/not-found.middleware'

import { API_ROUTES } from './api-routes'

/**
 * Monta a aplicação Express sem subir o servidor.
 *
 * Separado do `server.ts` para que os testes de integração possam instanciar a
 * app com Supertest sem abrir porta nem depender do ciclo de vida do processo.
 *
 * A ordem dos middlewares importa: segurança → CORS → limite → parser →
 * documentação → rotas → 404 → tratador de erros. O tratador de erros é
 * sempre o último; registrado antes, nunca receberia o erro.
 */
export function createApp(): Express {
  const app = express()

  // Atrás de proxy (Docker, Nginx), sem isto o rate limit veria o IP do proxy
  // para todo mundo e limitaria todos os clientes como se fossem um só.
  app.set('trust proxy', 1)

  app.use(
    helmet({
      // A UI do Swagger carrega estilos e scripts próprios; a CSP padrão do
      // helmet os bloquearia.
      contentSecurityPolicy: false,
      // O padrão (`same-origin`) faria o navegador recusar as imagens de
      // `/uploads` ao serem exibidas pelo front-end, que roda em outra origem.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  )
  app.use(cors(corsOptions))

  /**
   * Arquivos enviados pelo organizador.
   *
   * Antes do rate limiter de propósito: uma página com vários cards dispara
   * uma requisição por imagem, e sob o limite da API a grade começaria a
   * falhar com 429 justamente nas telas mais cheias.
   *
   * Arquivo inexistente segue a cadeia até o `notFoundHandler`, que responde
   * 404 em JSON como o resto da API. (`fallthrough: false` devolveria o erro
   * ao tratador global, que não reconhece o erro do `serve-static` e o
   * converteria em 500 — status errado e ruído no log a cada capa removida.)
   */
  app.use(
    '/uploads',
    express.static(path.join(process.cwd(), 'public', 'uploads'), {
      index: false,
      maxAge: '1d',
    }),
  )

  app.use(apiRateLimiter)
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true }))

  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'ViaPass API',
      swaggerOptions: { persistAuthorization: true },
    }),
  )
  app.get('/docs.json', (_req, res) => res.json(swaggerSpec))

  // Montagem a partir do registro central — a mesma lista que a auditoria de
  // políticas de acesso percorre, para que nenhuma rota exista só num dos dois.
  for (const { prefix, router } of API_ROUTES) {
    app.use(prefix, router)
  }

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
