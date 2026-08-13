import { Router } from 'express'
import { AppDataSource } from '../../config/database'
import { roleGuard } from '../../middlewares/auth.middleware'
import { validateBody } from '../../middlewares/validate.middleware'
import { UserRole } from '../../shared/types/enums'
import { Attraction } from '../attractions/attraction.entity'
import { AttractionService } from '../attractions/attraction.service'
import { Classification } from '../classifications/classification.entity'
import { ClassificationService } from '../classifications/classification.service'
import { TicketmasterClient } from '../catalog/ticketmaster.client'
import { Event } from '../events/event.entity'
import { EventService } from '../events/event.service'
import { TicketPoolService } from '../tickets/ticket-pool.service'
import { Venue } from '../venues/venue.entity'
import { VenueService } from '../venues/venue.service'
import { OrderController } from './order.controller'
import { OrderService } from './order.service'
import { PaymentService } from './payment.service'
import { CreateOrderDTO, PayOrderDTO } from './order.dto'
import { Order } from './order.entity'

const router = Router()

const eventService = new EventService(
  AppDataSource,
  AppDataSource.getRepository(Event),
  new VenueService(AppDataSource.getRepository(Venue)),
  new AttractionService(AppDataSource.getRepository(Attraction)),
  new ClassificationService(AppDataSource.getRepository(Classification)),
  new TicketPoolService(),
  new TicketmasterClient(),
)

const controller = new OrderController(
  new OrderService(
    AppDataSource,
    AppDataSource.getRepository(Order),
    eventService,
    new PaymentService(),
  ),
)

/**
 * @openapi
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:            { type: string, format: uuid }
 *         status:        { $ref: '#/components/schemas/OrderStatus' }
 *         totalAmount:   { type: string, example: '400.00', description: String para não perder precisão }
 *         currency:      { type: string, example: BRL }
 *         paymentMethod: { type: string, nullable: true, example: credit_card }
 *         paymentId:     { type: string, nullable: true, example: sim_5f2c... }
 *         paidAt:        { type: string, format: date-time, nullable: true }
 *         event:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:        { type: string, format: uuid }
 *             name:      { type: string }
 *             eventDate: { type: string, format: date }
 *             venueName: { type: string, nullable: true }
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:           { type: string, format: uuid }
 *               ticketId:     { type: string, format: uuid }
 *               seatLabel:    { type: string, nullable: true, example: 'Plateia A · Fileira B · Assento 7' }
 *               unitPrice:    { type: string, example: '200.00' }
 *               ticketStatus: { $ref: '#/components/schemas/TicketStatus' }
 */

/**
 * @openapi
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Cria o pedido e reserva os ingressos
 *     description: >
 *       Reserva atômica. Em evento com mapa de assentos, informe `ticketIds`;
 *       em pista, informe `quantity`.
 *
 *
 *       O pedido nasce `pending` — os ingressos ficam `reserved` até o
 *       pagamento. Se outro cliente levar o assento no meio do caminho, a
 *       resposta é 409 e nada é reservado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId]
 *             properties:
 *               eventId:   { type: string, format: uuid }
 *               ticketIds:
 *                 type: array
 *                 maxItems: 8
 *                 items: { type: string, format: uuid }
 *                 description: Obrigatório em evento com mapa de assentos.
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 8
 *                 description: Obrigatório em evento de pista.
 *     responses:
 *       201:
 *         description: Pedido criado e ingressos reservados.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409:
 *         description: Assento já reservado ou ingressos esgotados.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *             examples:
 *               assentoTomado: { value: { msg: Este assento já está reservado } }
 *               esgotado:      { value: { msg: Ingressos esgotados para este evento } }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/', roleGuard(UserRole.CLIENT), validateBody(CreateOrderDTO), controller.create)

/**
 * @openapi
 * /orders/my:
 *   get:
 *     tags: [Orders]
 *     summary: Pedidos do cliente autenticado
 *     parameters:
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
 *                 data: { type: array, items: { $ref: '#/components/schemas/Order' } }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/my', roleGuard(UserRole.CLIENT), controller.listMine)

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Detalhe de um pedido
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Pedido encontrado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id', roleGuard(UserRole.CLIENT), controller.getById)

/**
 * @openapi
 * /orders/{id}/pay:
 *   post:
 *     tags: [Orders]
 *     summary: Paga o pedido (simulado)
 *     description: >
 *       **Nenhuma transação financeira real acontece** e nenhum dado de cartão
 *       é armazenado.
 *
 *
 *       Regra da simulação, determinística para permitir testar os dois
 *       caminhos: cartão terminado em `0000` é **recusado**; qualquer outro é
 *       aprovado. Pix e boleto sempre aprovam.
 *
 *
 *       Na recusa, o pedido vira `failed` e os ingressos **voltam ao pool** —
 *       o cliente pode tentar de novo com outro cartão.
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paymentMethod]
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, pix, boleto]
 *               cardNumber:
 *                 type: string
 *                 description: Só para a simulação. Use final `0000` para forçar a recusa.
 *                 example: '4111111111111111'
 *     responses:
 *       200:
 *         description: Pagamento aprovado; ingressos passam a `sold`.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409:
 *         description: Pedido já pago ou em estado que não aceita pagamento.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *             example: { msg: Este pedido já foi pago }
 *       422:
 *         description: Pagamento recusado. Ingressos devolvidos ao pool.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *             example: { msg: Cartão recusado pelo emissor }
 */
router.post('/:id/pay', roleGuard(UserRole.CLIENT), validateBody(PayOrderDTO), controller.pay)

/**
 * @openapi
 * /orders/{id}/cancel:
 *   post:
 *     tags: [Orders]
 *     summary: Cancela o pedido e devolve os ingressos ao estoque
 *     description: >
 *       Pedido pago vira `refunded`; pendente vira `canceled`. Recusado se
 *       algum ingresso já foi validado na portaria.
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Pedido cancelado e capacidade devolvida.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 */
router.post('/:id/cancel', roleGuard(UserRole.CLIENT), controller.cancel)

export default router
