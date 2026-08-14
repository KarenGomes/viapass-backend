import { Router } from 'express'
import { roleGuard } from '../../middlewares/auth.middleware'
import { UserRole } from '../../shared/types/enums'
import { CatalogController } from './catalog.controller'
import { CatalogService } from './catalog.service'
import { TicketmasterClient } from './ticketmaster.client'

const router = Router()
const controller = new CatalogController(new CatalogService(new TicketmasterClient()))

/**
 * @openapi
 * components:
 *   schemas:
 *     CatalogItem:
 *       type: object
 *       description: Resumo de um evento do catálogo da Ticketmaster. Não está no nosso banco.
 *       properties:
 *         tmEventId:   { type: string, example: G5diZ9K3n1Cn- }
 *         name:        { type: string, example: Coldplay - Music of the Spheres }
 *         date:        { type: string, format: date, nullable: true, example: '2026-11-15' }
 *         time:        { type: string, nullable: true, example: '20:00:00' }
 *         venueName:   { type: string, nullable: true, example: Estádio do Morumbi }
 *         city:        { type: string, nullable: true, example: São Paulo }
 *         countryCode: { type: string, nullable: true, example: BR }
 *         imageUrl:    { type: string, nullable: true }
 *         segment:     { type: string, nullable: true, example: Music }
 *         genre:       { type: string, nullable: true, example: Rock }
 *         minPrice:    { type: string, nullable: true, example: '120.00' }
 *         maxPrice:    { type: string, nullable: true, example: '890.00' }
 *         currency:    { type: string, nullable: true, example: BRL }
 *         status:      { type: string, nullable: true, example: onsale }
 */

/**
 * @openapi
 * /catalog/search:
 *   get:
 *     tags: [Catalog]
 *     summary: Busca eventos no catálogo da Ticketmaster
 *     description: >
 *       Consulta em tempo real a Discovery API. **Não persiste nada** — serve
 *       para o organizador escolher o que importar.
 *
 *
 *       Limites da API externa: 5 requisições por segundo, 5.000 por dia e
 *       paginação profunda até `size × page < 1000`. Estourar o teto de
 *       paginação devolve 400 antes de gastar a cota.
 *     parameters:
 *       - { in: query, name: keyword, schema: { type: string }, example: Coldplay }
 *       - { in: query, name: city, schema: { type: string }, example: São Paulo }
 *       - { in: query, name: countryCode, schema: { type: string }, example: BR }
 *       - { in: query, name: classificationName, schema: { type: string }, example: Music }
 *       - { in: query, name: startDateTime, schema: { type: string }, example: '2026-01-01T00:00:00Z' }
 *       - { in: query, name: endDateTime, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer, default: 0 }, description: Começa em 0 }
 *       - { in: query, name: size, schema: { type: integer, default: 20, maximum: 200 } }
 *     responses:
 *       200:
 *         description: Resultado da busca.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/CatalogItem' }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:       { type: integer, example: 0 }
 *                     size:       { type: integer, example: 20 }
 *                     totalItems: { type: integer, example: 137 }
 *                     totalPages: { type: integer, example: 7 }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       502: { $ref: '#/components/responses/BadGateway' }
 *       503:
 *         description: Integração com a Ticketmaster não configurada (`TM_API_KEY` ausente ou inválida).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *             example: { msg: Integração com a Ticketmaster não está configurada }
 */
router.get('/search', roleGuard(UserRole.ORGANIZER), controller.search)

/**
 * @openapi
 * /catalog/events/{tmId}:
 *   get:
 *     tags: [Catalog]
 *     summary: Detalhe de um evento do catálogo externo
 *     parameters:
 *       - { in: path, name: tmId, required: true, schema: { type: string }, example: G5diZ9K3n1Cn- }
 *     responses:
 *       200:
 *         description: Evento encontrado no catálogo.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CatalogItem' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       502: { $ref: '#/components/responses/BadGateway' }
 */
router.get('/events/:tmId', roleGuard(UserRole.ORGANIZER), controller.getEvent)

export default router
