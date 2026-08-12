import type { DataSource } from 'typeorm'
import { HealthService } from './health.service'

/** DataSource mínimo — só o que o HealthService realmente usa. */
function dataSourceStub(overrides: Partial<DataSource> = {}): DataSource {
  return {
    isInitialized: true,
    query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    ...overrides,
  } as unknown as DataSource
}

describe('HealthService', () => {
  it('reporta ok quando o banco responde', async () => {
    const service = new HealthService(dataSourceStub(), '1.0.0')

    const report = await service.check()

    expect(report.status).toBe('ok')
    expect(report.database.status).toBe('up')
    expect(report.version).toBe('1.0.0')
  })

  it('consulta o banco de verdade, não apenas o estado do processo', async () => {
    const query = jest.fn().mockResolvedValue([])
    const service = new HealthService(dataSourceStub({ query } as Partial<DataSource>), '1.0.0')

    await service.check()

    expect(query).toHaveBeenCalledWith('SELECT 1')
  })

  it('reporta degraded quando a query falha', async () => {
    const service = new HealthService(
      dataSourceStub({
        query: jest.fn().mockRejectedValue(new Error('connection refused')),
      } as Partial<DataSource>),
      '1.0.0',
    )

    const report = await service.check()

    expect(report.status).toBe('degraded')
    expect(report.database.status).toBe('down')
    expect(report.database.latencyMs).toBeNull()
  })

  it('reporta degraded sem consultar quando o DataSource não foi inicializado', async () => {
    const query = jest.fn()
    const service = new HealthService(
      dataSourceStub({ isInitialized: false, query } as Partial<DataSource>),
      '1.0.0',
    )

    const report = await service.check()

    expect(report.database.status).toBe('down')
    expect(query).not.toHaveBeenCalled()
  })

  it('mede a latência do banco quando está no ar', async () => {
    const service = new HealthService(dataSourceStub(), '1.0.0')

    const report = await service.check()

    expect(report.database.latencyMs).toEqual(expect.any(Number))
    expect(report.database.latencyMs).toBeGreaterThanOrEqual(0)
  })

  it('não vaza a mensagem de erro do banco no relatório', async () => {
    const service = new HealthService(
      dataSourceStub({
        query: jest.fn().mockRejectedValue(new Error('password authentication failed for "viapass"')),
      } as Partial<DataSource>),
      '1.0.0',
    )

    const report = await service.check()

    expect(JSON.stringify(report)).not.toContain('password')
  })

  it('inclui uptime e timestamp ISO', async () => {
    const service = new HealthService(dataSourceStub(), '1.0.0')

    const report = await service.check()

    expect(report.uptime).toBeGreaterThan(0)
    expect(() => new Date(report.timestamp).toISOString()).not.toThrow()
  })
})
