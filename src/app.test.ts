import request from 'supertest'
import type { Express } from 'express'

/**
 * Testes de integração da app HTTP.
 *
 * O DataSource é mockado: aqui interessa a montagem do Express — rotas,
 * middlewares, formato das respostas — e não o banco. A conexão real é
 * validada pelo healthcheck do Docker.
 */
jest.mock('./config/database', () => ({
  AppDataSource: {
    isInitialized: true,
    query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  },
}))

// `require` e não `import`: o mock acima precisa estar aplicado antes de
// `app.ts` resolver `config/database`, e os imports são içados para o topo.
const { createApp } = require('./app') as { createApp: () => Express }

describe('app', () => {
  const app = createApp()

  describe('GET /api/health', () => {
    it('responde 200 com o estado do banco', async () => {
      const response = await request(app).get('/api/health')

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        status: 'ok',
        database: { status: 'up' },
      })
    })

    it('não exige autenticação', async () => {
      const response = await request(app).get('/api/health')

      expect(response.status).not.toBe(401)
    })
  })

  describe('documentação', () => {
    it('serve o OpenAPI em /docs.json', async () => {
      const response = await request(app).get('/docs.json')

      expect(response.status).toBe(200)
      expect(response.body.openapi).toBe('3.0.3')
      expect(response.body.info.title).toBe('ViaPass API')
    })

    it('declara as respostas de erro reutilizáveis que o front consome', async () => {
      const response = await request(app).get('/docs.json')

      expect(Object.keys(response.body.components.responses)).toEqual(
        expect.arrayContaining([
          'BadRequest',
          'Unauthorized',
          'Forbidden',
          'NotFound',
          'Conflict',
          'UnprocessableEntity',
          'TooManyRequests',
          'InternalError',
        ]),
      )
    })

    it('descreve todo erro no formato { msg }', async () => {
      const response = await request(app).get('/docs.json')
      const errorSchema = response.body.components.schemas.ErrorResponse

      expect(errorSchema.required).toEqual(['msg'])
      expect(errorSchema.properties.msg.type).toBe('string')
    })

    it('documenta o endpoint de health lido do JSDoc das rotas', async () => {
      const response = await request(app).get('/docs.json')

      // Se o glob de `apis` quebrar, este teste é o que avisa.
      expect(response.body.paths['/health']).toBeDefined()
      expect(response.body.paths['/health'].get.tags).toContain('Health')
    })
  })

  describe('rota inexistente', () => {
    it('responde 404 em JSON, não em HTML', async () => {
      const response = await request(app).get('/api/nao-existe')

      expect(response.status).toBe(404)
      expect(response.type).toBe('application/json')
      expect(response.body).toEqual({ msg: 'Rota não encontrada' })
    })
  })

  describe('segurança', () => {
    it('aplica os headers do helmet', async () => {
      const response = await request(app).get('/api/health')

      expect(response.headers['x-content-type-options']).toBe('nosniff')
      expect(response.headers['x-dns-prefetch-control']).toBeDefined()
    })

    it('não revela o Express no header x-powered-by', async () => {
      const response = await request(app).get('/api/health')

      expect(response.headers['x-powered-by']).toBeUndefined()
    })

    it('libera a origem do front-end configurada', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:5173')

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173')
      expect(response.headers['access-control-allow-credentials']).toBe('true')
    })
  })
})
