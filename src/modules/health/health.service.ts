import type { DataSource } from 'typeorm'

export interface DatabaseHealth {
  status: 'up' | 'down'
  latencyMs: number | null
}

export interface HealthReport {
  status: 'ok' | 'degraded'
  database: DatabaseHealth
  uptime: number
  timestamp: string
  version: string
}

/**
 * Verifica o estado da aplicação.
 *
 * O health check **consulta o banco de verdade** (`SELECT 1`). Um endpoint que
 * só responde "ok" porque o processo está vivo não serve para nada: o
 * contêiner subir não significa que ele alcança o Postgres, e é exatamente
 * essa a falha que o orquestrador precisa detectar.
 */
export class HealthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly version: string,
  ) {}

  async check(): Promise<HealthReport> {
    const database = await this.checkDatabase()

    return {
      status: database.status === 'up' ? 'ok' : 'degraded',
      database,
      uptime: Number(process.uptime().toFixed(2)),
      timestamp: new Date().toISOString(),
      version: this.version,
    }
  }

  private async checkDatabase(): Promise<DatabaseHealth> {
    if (!this.dataSource.isInitialized) {
      return { status: 'down', latencyMs: null }
    }

    const startedAt = performance.now()

    try {
      await this.dataSource.query('SELECT 1')
      return { status: 'up', latencyMs: Math.round(performance.now() - startedAt) }
    } catch {
      // A causa da falha vai para o log do driver; aqui só interessa o veredito.
      return { status: 'down', latencyMs: null }
    }
  }
}
