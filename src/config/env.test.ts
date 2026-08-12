import { env } from './env'

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
