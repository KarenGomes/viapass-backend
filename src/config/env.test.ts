import { env, type Env } from './env'

/**
 * O `env` é validado no momento do import, então testá-lo com valores
 * inválidos exigiria reimportar o módulo com `jest.isolateModules`. Aqui
 * verificamos o contrato que o resto da aplicação consome.
 */
describe('env', () => {
  it('reconhece o ambiente de teste', () => {
    expect(env.NODE_ENV).toBe('test')
    expect(env.isTest).toBe(true)
    expect(env.isProduction).toBe(false)
  })

  it('converte portas para número', () => {
    expect(typeof env.PORT).toBe('number')
    expect(typeof env.DB_PORT).toBe('number')
  })

  it('aponta o front-end para a porta do Vite, não para a 3000', () => {
    // O .env.example original trazia localhost:3000, que não é onde o Vite roda.
    expect(env.APP_BASE_URL).toContain('5173')
  })

  it('exige segredos longos o bastante para JWT e HMAC', () => {
    expect(env.JWT_SECRET.length).toBeGreaterThanOrEqual(32)
    expect(env.JWT_REFRESH_SECRET.length).toBeGreaterThanOrEqual(32)
    expect(env.TICKET_HMAC_SECRET.length).toBeGreaterThanOrEqual(32)
  })

  it('usa segredos diferentes para access e refresh token', () => {
    // Segredos iguais permitiriam usar um refresh token como access token.
    expect(env.JWT_SECRET).not.toBe(env.JWT_REFRESH_SECRET)
  })

  it('aponta para a Discovery API v2 da Ticketmaster', () => {
    expect(env.TM_API_BASE_URL).toBe('https://app.ticketmaster.com/discovery/v2')
  })
})

/**
 * O `env` é validado no import, então cada caso reimporta o módulo com um
 * ambiente próprio.
 *
 * Estes testes existem por causa de um deploy real que falhou: sem `DB_HOST`,
 * a aplicação assumia `localhost`, subia normalmente e só quebrava ao conectar
 * — `ECONNREFUSED 127.0.0.1:5432`, depois da imagem construída e publicada.
 * Configuração faltando precisa falhar dizendo o que falta.
 */
describe('env — configuração de banco', () => {
  const original = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...original }
  })

  afterAll(() => {
    process.env = original
  })

  function load(): { env: Env } {
    return require('./env')
  }

  /**
   * String vazia, e não `delete`: `env.ts` importa `dotenv/config`, que relê o
   * `.env` do disco a cada import e repovoaria a variável apagada. O dotenv
   * não sobrescreve o que já está definido, então `''` sobrevive — e é o que
   * `databaseHost()` trata como ausente.
   */
  function unset(key: string) {
    process.env[key] = ''
  }

  it('recusa subir em produção sem DB_HOST, dizendo o que falta', () => {
    process.env.NODE_ENV = 'production'
    unset('DB_HOST')
    unset('DATABASE_URL')

    expect(load).toThrow(/DB_HOST é obrigatória em produção/)
  })

  it('aceita DATABASE_URL no lugar dos campos avulsos', () => {
    process.env.NODE_ENV = 'production'
    process.env.DATABASE_URL = 'postgresql://user:pass@db.interno/viapass'
    unset('DB_HOST')
    unset('DB_USERNAME')
    unset('DB_PASSWORD')
    unset('DB_DATABASE')

    expect(load().env.DATABASE_URL).toBe('postgresql://user:pass@db.interno/viapass')
  })

  it('mantém localhost como padrão fora de produção', () => {
    unset('DB_HOST')

    expect(load().env.DB_HOST).toBe('localhost')
  })

  it.each([
    ['true', true],
    ['1', true],
    ['false', false],
    ['0', false],
  ])('lê DB_SSL=%s como %s', (raw, expected) => {
    process.env.DB_SSL = raw

    expect(load().env.DB_SSL).toBe(expected)
  })

  it('vem com TLS desligado por padrão — o endereço interno dispensa', () => {
    delete process.env.DB_SSL

    expect(load().env.DB_SSL).toBe(false)
  })

  it('recusa DB_SSL com valor que não é booleano', () => {
    process.env.DB_SSL = 'talvez'

    expect(load).toThrow(/DB_SSL deve ser true ou false/)
  })
})
