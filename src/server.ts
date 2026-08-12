import 'reflect-metadata'
import type { Server } from 'node:http'

import { createApp } from './app'
import { AppDataSource } from './config/database'
import { env } from './config/env'
import { API_PREFIX } from './shared/constants'

/**
 * Ponto de entrada.
 *
 * O banco conecta **antes** do servidor começar a escutar. Subir a porta
 * primeiro faria a aplicação aceitar requisições que falhariam todas — pior
 * que não subir, porque o orquestrador acharia que deu certo.
 */
async function bootstrap(): Promise<void> {
  await AppDataSource.initialize()
  console.log(`[db] conectado a ${env.DB_HOST}:${env.DB_PORT}/${env.DB_DATABASE}`)

  const pending = await AppDataSource.showMigrations()
  if (pending) {
    console.warn('[db] há migrations pendentes — rode `npm run migration:run`')
  }

  const app = createApp()
  const server = app.listen(env.PORT, () => {
    console.log(`[api] ouvindo em http://localhost:${env.PORT}${API_PREFIX}`)
    console.log(`[api] documentação em http://localhost:${env.PORT}/docs`)
    console.log(`[api] ambiente: ${env.NODE_ENV}`)
  })

  registerShutdown(server)
}

/**
 * Encerramento gracioso: para de aceitar conexões novas, espera as em curso e
 * só então fecha o pool do banco. Sem isso, `docker compose down` derruba a
 * aplicação no meio de uma transação.
 */
function registerShutdown(server: Server): void {
  let shuttingDown = false

  const closeDatabase = async (): Promise<void> => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      console.log('[db] conexão encerrada')
    }
    process.exit(0)
  }

  const shutdown = (signal: string): void => {
    if (shuttingDown) return
    shuttingDown = true

    console.log(`[api] ${signal} recebido, encerrando...`)

    // O callback do `close` é síncrono na assinatura do Node; a promessa vai
    // encadeada com tratamento próprio em vez de tornar o callback `async`.
    server.close(() => {
      closeDatabase().catch((error: unknown) => {
        console.error('[db] falha ao encerrar a conexão:', error)
        process.exit(1)
      })
    })

    // Conexão pendurada não pode segurar o processo para sempre.
    setTimeout(() => {
      console.error('[api] encerramento forçado após 10s')
      process.exit(1)
    }, 10_000).unref()
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

bootstrap().catch((error: unknown) => {
  console.error('[api] falha ao iniciar:', error)
  process.exit(1)
})
