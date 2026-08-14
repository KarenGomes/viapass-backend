import { Router } from 'express'
import { AppDataSource } from '../../config/database'
import { optionalAuth, publicRoute, roleGuard } from '../../middlewares/auth.middleware'
import { validateBody } from '../../middlewares/validate.middleware'
import { UserRole } from '../../shared/types/enums'
import { Attraction } from '../attractions/attraction.entity'
import { AttractionService } from '../attractions/attraction.service'
import { Classification } from '../classifications/classification.entity'
import { ClassificationService } from '../classifications/classification.service'
import { TicketmasterClient } from '../catalog/ticketmaster.client'
import { TicketPoolService } from '../tickets/ticket-pool.service'
import { Venue } from '../venues/venue.entity'
import { VenueService } from '../venues/venue.service'
import { EventController } from './event.controller'
import { EventService } from './event.service'
import { CreateEventDTO, ImportEventDTO, UpdateEventDTO } from './event.dto'
import { Event } from './event.entity'

const router = Router()

const controller = new EventController(
  new EventService(
    AppDataSource,
    AppDataSource.getRepository(Event),
    new VenueService(AppDataSource.getRepository(Venue)),
    new AttractionService(AppDataSource.getRepository(Attraction)),
    new ClassificationService(AppDataSource.getRepository(Classification)),
    new TicketPoolService(),
    new TicketmasterClient(),
  ),
)

/**
 * @openapi
 * components:
 *   schemas:
 *     EventSummary:
 *       type: object
 *       properties:
 *         id:                { type: string, format: uuid }
 *         name:              { type: string, example: Gala na Ópera }
 *         description:       { type: string, nullable: true }
 *         eventDate:         { type: string, format: date, example: '2026-11-15' }
 *         eventTime:         { type: string, nullable: true, example: '20:00:00' }
 *         status:            { $ref: '#/components/schemas/EventStatus' }
 *         seatType:          { $ref: '#/components/schemas/SeatType' }
 *         totalCapacity:     { type: integer, example: 240 }
 *         availableCapacity: { type: integer, example: 187 }
 *         imageUrl:          { type: string, nullable: true }
 *         priceFrom:         { type: number, nullable: true, example: 120 }
 *         venue:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:   { type: string, format: uuid }
 *             name: { type: string, example: Teatro Municipal }
 *             city: { type: string, nullable: true, example: São Paulo }
 *     EventDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/EventSummary'
 *         - type: object
 *           properties:
 *             tmEventId:     { type: string, nullable: true }
 *             seatmapUrl:    { type: string, nullable: true }
 *             seatMapConfig:
 *               type: object
 *               nullable: true
 *               description: Seções, fileiras e preços. Fonte do preço de venda.
 *             attractions:   { type: array, items: { type: object } }
 *             images:        { type: array, items: { type: object } }
 *             priceRanges:
 *               type: array
 *               description: Faixa anunciada pela Ticketmaster. Referência, não preço de venda.
 *               items: { type: object }
 *             priceRange:
 *               type: object
 *               nullable: true
 *               description: Menor e maior preço de venda entre os setores.
 *               properties:
 *                 min:      { type: number, example: 60 }
 *                 max:      { type: number, example: 200 }
 *                 currency: { type: string, example: BRL }
 *             sectors:
 *               type: array
 *               description: >
 *                 Setores com preço e disponibilidade real, apurada por
 *                 `GROUP BY` em `tickets`. Alimenta o bloco "Selecione um
 *                 setor" da tela de detalhe.
 *               items:
 *                 type: object
 *                 properties:
 *                   name:           { type: string, example: Plateia A }
 *                   priceFrom:      { type: number, example: 100 }
 *                   priceTo:        { type: number, example: 200 }
 *                   totalSeats:     { type: integer, example: 36 }
 *                   availableSeats: { type: integer, example: 34 }
 *                   soldOut:        { type: boolean }
 */

/**
 * @openapi
 * /events:
 *   get:
 *     tags: [Events]
 *     summary: Lista eventos publicados
 *     description: >
 *       Pública. Um organizador autenticado pode passar `mine=true` para
 *       incluir os próprios rascunhos — é o painel dele.
 *     security: []
 *     parameters:
 *       - { in: query, name: search, schema: { type: string }, description: Busca em nome e descrição }
 *       - { in: query, name: city, schema: { type: string } }
 *       - { in: query, name: segment, schema: { type: string }, example: Music }
 *       - { in: query, name: dateFrom, schema: { type: string, format: date } }
 *       - { in: query, name: dateTo, schema: { type: string, format: date } }
 *       - { in: query, name: mine, schema: { type: boolean }, description: Requer papel organizer }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: size, schema: { type: integer, default: 20, maximum: 100 } }
 *     responses:
 *       200:
 *         description: Lista paginada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/EventSummary' } }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       500: { $ref: '#/components/responses/InternalError' }
 */
router.get('/', optionalAuth(), controller.list)

/**
 * @openapi
 * /events/locations:
 *   get:
 *     tags: [Events]
 *     summary: Cidades com eventos publicados
 *     description: >
 *       Alimenta o filtro de local. Só considera eventos visíveis ao público —
 *       oferecer um filtro que devolve zero resultados é pior que não oferecer.
 *
 *
 *       Declarada **antes** de `/events/{id}` de propósito: registrada depois,
 *       o Express casaria `locations` como se fosse um id.
 *     security: []
 *     responses:
 *       200:
 *         description: Cidades e quantos eventos cada uma tem.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       city:       { type: string, example: São Paulo }
 *                       stateCode:  { type: string, nullable: true, example: SP }
 *                       eventCount: { type: integer, example: 3 }
 */
router.get('/locations', publicRoute(), controller.locations)

/**
 * @openapi
 * /events/{id}:
 *   get:
 *     tags: [Events]
 *     summary: Detalhe de um evento
 *     description: Rascunho só é visível para o organizador dono; para os demais devolve 404.
 *     security: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Evento encontrado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/EventDetail' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id', optionalAuth(), controller.getById)

/**
 * @openapi
 * /events/{id}/seats:
 *   get:
 *     tags: [Events]
 *     summary: Mapa de ocupação do evento
 *     description: >
 *       O que o front precisa para desenhar a seleção de assentos: cada lugar,
 *       se está livre e o preço da seção.
 *
 *
 *       Devolve apenas id, posição e disponibilidade — **nunca** o código nem a
 *       assinatura do ingresso. Expor o código de um ingresso à venda
 *       permitiria tentar entrar com um assento que ninguém comprou.
 *
 *
 *       Em evento de pista, `seats` vem vazio: o cliente escolhe quantidade,
 *       não lugar. Use `availableCount`.
 *     security: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Mapa de ocupação.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 seatType:       { $ref: '#/components/schemas/SeatType' }
 *                 availableCount: { type: integer, example: 82 }
 *                 totalCount:     { type: integer, example: 84 }
 *                 seats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:        { type: string, format: uuid, description: Use em `POST /orders` como ticketId }
 *                       section:   { type: string, nullable: true, example: Plateia A }
 *                       row:       { type: string, nullable: true, example: B }
 *                       number:    { type: integer, nullable: true, example: 7 }
 *                       label:     { type: string, nullable: true }
 *                       price:     { type: number, nullable: true, example: 200 }
 *                       available: { type: boolean }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id/seats', publicRoute(), controller.seatMap)

/**
 * @openapi
 * /events:
 *   post:
 *     tags: [Events]
 *     summary: Cria um evento do zero (rascunho)
 *     description: >
 *       Nasce em `draft`. A capacidade é a soma dos assentos declarados quando
 *       `seatType = mapped`, ou `totalCapacity` quando é pista.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, eventDate, venue, seatType]
 *             properties:
 *               name:        { type: string, example: Noite de Estreia de La Traviata }
 *               description: { type: string }
 *               eventDate:   { type: string, format: date, example: '2026-10-24' }
 *               eventTime:   { type: string, example: '20:00' }
 *               venue:
 *                 type: object
 *                 required: [name]
 *                 properties:
 *                   name:        { type: string, example: Teatro Municipal }
 *                   addressLine1: { type: string }
 *                   city:        { type: string, example: São Paulo }
 *                   stateCode:   { type: string, example: SP }
 *                   countryCode: { type: string, example: BR }
 *               seatType:      { $ref: '#/components/schemas/SeatType' }
 *               totalCapacity: { type: integer, description: Obrigatório em pista, example: 500 }
 *               price:         { type: number, description: Preço único da pista, example: 150 }
 *               seatMapConfig:
 *                 type: object
 *                 description: Obrigatório quando seatType = mapped.
 *                 properties:
 *                   sections:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:  { type: string, example: Plateia A }
 *                         price: { type: number, example: 200 }
 *                         rows:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               label: { type: string, example: A }
 *                               seats: { type: integer, example: 12 }
 *     responses:
 *       201:
 *         description: Evento criado em rascunho.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/EventDetail' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.post('/', roleGuard(UserRole.ORGANIZER), validateBody(CreateEventDTO), controller.create)

/**
 * @openapi
 * /events/import:
 *   post:
 *     tags: [Events]
 *     summary: Importa um evento do catálogo da Ticketmaster
 *     description: >
 *       Persiste local, atrações, classificação, imagens e faixas de preço.
 *       O evento entra como **rascunho**: a Discovery API não fornece
 *       capacidade, assentos nem preço de venda (MER §6.1), então o
 *       organizador precisa completar com `PUT /events/{id}` antes de publicar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tmEventId]
 *             properties:
 *               tmEventId: { type: string, example: G5diZ9K3n1Cn- }
 *     responses:
 *       201:
 *         description: Evento importado como rascunho.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/EventDetail' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409:
 *         description: Este evento da Ticketmaster já foi importado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *             example: { msg: Este evento da Ticketmaster já foi importado }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 *       502: { $ref: '#/components/responses/BadGateway' }
 *       503:
 *         description: '`TM_API_KEY` ausente ou inválida.'
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post(
  '/import',
  roleGuard(UserRole.ORGANIZER),
  validateBody(ImportEventDTO),
  controller.importFromCatalog,
)

/**
 * @openapi
 * /events/{id}:
 *   put:
 *     tags: [Events]
 *     summary: Atualiza um evento
 *     description: >
 *       Capacidade, preço e mapa de assentos só podem mudar **antes** da
 *       publicação — depois disso o pool de ingressos já existe e pode ter
 *       vendas.
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:          { type: string }
 *               description:   { type: string }
 *               eventDate:     { type: string, format: date }
 *               eventTime:     { type: string }
 *               totalCapacity: { type: integer }
 *               price:         { type: number }
 *               seatMapConfig: { type: object }
 *               saleStart:     { type: string, format: date-time }
 *               saleEnd:       { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Evento atualizado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/EventDetail' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 */
router.put('/:id', roleGuard(UserRole.ORGANIZER), validateBody(UpdateEventDTO), controller.update)

/**
 * @openapi
 * /events/{id}/publish:
 *   post:
 *     tags: [Events]
 *     summary: Publica o evento e gera o pool de ingressos
 *     description: >
 *       Gera um ingresso por assento (`mapped`) ou por unidade de capacidade
 *       (`general_admission`), cada um com código legível e assinatura HMAC.
 *       Publicação e geração acontecem na mesma transação — sem isso haveria
 *       uma janela com o evento à venda e sem ingressos.
 *
 *
 *       Idempotente: republicar não duplica o pool.
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Evento publicado.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/EventDetail'
 *                 - type: object
 *                   properties:
 *                     ticketsCreated: { type: integer, example: 240 }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/:id/publish', roleGuard(UserRole.ORGANIZER), controller.publish)

/**
 * @openapi
 * /events/{id}/cancel:
 *   post:
 *     tags: [Events]
 *     summary: Cancela o evento
 *     description: Não apaga — pedidos e ingressos apontam para ele.
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Evento cancelado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/EventDetail' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.post('/:id/cancel', roleGuard(UserRole.ORGANIZER), controller.cancel)

/**
 * @openapi
 * /events/{id}:
 *   delete:
 *     tags: [Events]
 *     summary: Exclui um rascunho sem ingressos reservados
 *     description: Evento publicado não é excluído — use `POST /events/{id}/cancel`.
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       204: { description: Evento excluído. }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 */
router.delete('/:id', roleGuard(UserRole.ORGANIZER), controller.remove)

export default router
