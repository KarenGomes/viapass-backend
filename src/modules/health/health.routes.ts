import { Router } from 'express'
import { AppDataSource } from '../../config/database'
import { HealthController } from './health.controller'
import { HealthService } from './health.service'
import { APP_VERSION } from '../../shared/constants'

const router = Router()
const controller = new HealthController(new HealthService(AppDataSource, APP_VERSION))

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Estado da aplicação e do banco de dados
 *     description: >
 *       Executa `SELECT 1` no PostgreSQL para confirmar que a conexão está viva.
 *       Usado pelo healthcheck do Docker e por load balancers.
 *     security: []
 *     responses:
 *       200:
 *         description: Aplicação e banco operando normalmente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               status: ok
 *               database: { status: up, latencyMs: 3 }
 *               uptime: 128.4
 *               timestamp: '2026-08-12T12:00:00.000Z'
 *               version: 1.0.0
 *       503:
 *         description: Aplicação no ar, mas sem conexão com o banco.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               status: degraded
 *               database: { status: down, latencyMs: null }
 *               uptime: 4.1
 *               timestamp: '2026-08-12T12:00:00.000Z'
 *               version: 1.0.0
 */
router.get('/', controller.check)

export default router
