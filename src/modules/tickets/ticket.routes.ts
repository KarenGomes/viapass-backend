import { Router } from 'express'
import { AppDataSource } from '../../config/database'
import { publicRoute, roleGuard } from '../../middlewares/auth.middleware'
import { UserRole } from '../../shared/types/enums'
import { TicketController } from './ticket.controller'
import { TicketService } from './ticket.service'
import { Ticket } from './ticket.entity'
import { TicketShare } from './ticket-share.entity'

const router = Router()

const controller = new TicketController(
  new TicketService(
    AppDataSource,
    AppDataSource.getRepository(Ticket),
    AppDataSource.getRepository(TicketShare),
  ),
)

/**
 * @openapi
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       properties:
 *         id:          { type: string, format: uuid }
 *         code:        { type: string, example: VP-A3S12-X7K9, description: Código para digitação manual na portaria }
 *         status:      { $ref: '#/components/schemas/TicketStatus' }
 *         seatLabel:   { type: string, nullable: true, example: 'Plateia A · Fileira B · Assento 7' }
 *         seatSection: { type: string, nullable: true }
 *         seatRow:     { type: string, nullable: true }
 *         seatNumber:  { type: integer, nullable: true }
 *         event:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:        { type: string, format: uuid }
 *             name:      { type: string }
 *             eventDate: { type: string, format: date }
 *             venueName: { type: string, nullable: true }
 *     TicketWithQr:
 *       allOf:
 *         - $ref: '#/components/schemas/Ticket'
 *         - type: object
 *           properties:
 *             qrPayload:
 *               type: string
 *               example: VP-A3S12-X7K9.9f2c8a...
 *               description: Conteúdo gravado no QR — código e assinatura HMAC.
 *             qrDataUrl:
 *               type: string
 *               description: PNG em data URI, pronto para `<img src>`.
 */

/**
 * @openapi
 * /tickets/my:
 *   get:
 *     tags: [Tickets]
 *     summary: Ingressos do cliente autenticado
 *     description: Lista apenas ingressos pagos (`sold`) e já utilizados (`used`).
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
 *                 data: { type: array, items: { $ref: '#/components/schemas/Ticket' } }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/my', roleGuard(UserRole.CLIENT), controller.listMine)

/**
 * @openapi
 * /tickets/{id}:
 *   get:
 *     tags: [Tickets]
 *     summary: Detalhe do ingresso com o QR Code
 *     description: >
 *       O QR é renderizado sob demanda a partir do código e da assinatura —
 *       nenhuma imagem é armazenada.
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Ingresso com QR.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/TicketWithQr' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id', roleGuard(UserRole.CLIENT), controller.getWithQr)

/**
 * @openapi
 * /tickets/{id}/share:
 *   post:
 *     tags: [Tickets]
 *     summary: Gera um link de compartilhamento do ingresso
 *     description: >
 *       Token aleatório de 32 bytes, válido por 48 horas e resgatável uma
 *       única vez. Gerar um link novo invalida os anteriores ainda abertos.
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       201:
 *         description: Link gerado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shareToken: { type: string }
 *                 url:        { type: string, example: 'http://localhost:5173/ingressos/resgatar/9f2c...' }
 *                 expiresAt:  { type: string, format: date-time }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 */
router.post('/:id/share', roleGuard(UserRole.CLIENT), controller.share)

/**
 * @openapi
 * /tickets/shares/{token}:
 *   get:
 *     tags: [Tickets]
 *     summary: Pré-visualiza um link de compartilhamento
 *     description: >
 *       Pública, para o destinatário ver o que vai resgatar antes de fazer
 *       login. Devolve só nome do evento e assento — nunca o código nem o QR.
 *     security: []
 *     parameters:
 *       - { in: path, name: token, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Link válido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 eventName: { type: string }
 *                 seatLabel: { type: string, nullable: true }
 *                 expiresAt: { type: string, format: date-time }
 *                 isClaimed: { type: boolean }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.get('/shares/:token', publicRoute(), controller.previewShare)

/**
 * @openapi
 * /tickets/claim/{token}:
 *   post:
 *     tags: [Tickets]
 *     summary: Resgata um ingresso compartilhado
 *     description: >
 *       Transfere a posse para o cliente autenticado. Transação com
 *       `WHERE is_claimed = false` — dois cliques simultâneos no mesmo link
 *       só podem resultar em um resgate.
 *     parameters:
 *       - { in: path, name: token, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Ingresso resgatado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Ticket' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/claim/:token', roleGuard(UserRole.CLIENT), controller.claim)

export default router
