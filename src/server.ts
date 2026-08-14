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
  console.log(`[db] conectado a ${describeDatabase()}`)

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
 * Onde a aplicação se conectou, para o log de inicialização.
 *
 * Com `DATABASE_URL`, os campos avulsos ficam vazios e a linha sairia como
 * `conectado a :5432/`. A URL traz a senha embutida, então só host e nome do
 * banco são impressos — log de boot não é lugar para credencial.
 */
function describeDatabase(): string {
  if (!env.DATABASE_URL) {
    return `${env.DB_HOST}:${env.DB_PORT}/${env.DB_DATABASE}`
  }

  try {
    const url = new URL(env.DATABASE_URL)

    return `${url.hostname}:${url.port || '5432'}${url.pathname}`
  } catch {
    // URL malformada não derruba o boot: quem valida a conexão é o driver.
    return 'DATABASE_URL'
  }
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
