import { Router } from 'express'
import { AppDataSource } from '../../config/database'
import { roleGuard } from '../../middlewares/auth.middleware'
import { validateBody } from '../../middlewares/validate.middleware'
import { UserRole } from '../../shared/types/enums'
import { GateController } from './gate.controller'
import { GateService } from './gate.service'
import { ValidateTicketDTO } from './gate.dto'

const router = Router()
const controller = new GateController(new GateService(AppDataSource))

/**
 * @openapi
 * /gate/validate:
 *   post:
 *     tags: [Gate]
 *     summary: Valida um ingresso na entrada do evento
 *     description: >
 *       Aceita o conteúdo lido pela câmera (`CODIGO.assinatura`) ou o código
 *       digitado à mão (`VP-A3S12-X7K9`).
 *
 *
 *       **Responde 200 mesmo quando o ingresso é recusado.** Uma leitura
 *       recusada não é erro de requisição — a portaria fez tudo certo e o
 *       veredito está em `result`. O front deve olhar `result`, não o status
 *       HTTP.
 *
 *
 *       Toda tentativa é registrada, inclusive as recusadas.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [payload]
 *             properties:
 *               payload:
 *                 type: string
 *                 example: VP-A3S12-X7K9.9f2c8a1b...
 *                 description: Conteúdo do QR, ou apenas o código para digitação manual.
 *               eventId:
 *                 type: string
 *                 format: uuid
 *                 description: >
 *                   Evento em que a portaria está operando. Sem ele não há
 *                   como devolver `wrong_event`.
 *     responses:
 *       200:
 *         description: Veredito da validação.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:  { $ref: '#/components/schemas/ValidationResult' }
 *                 message: { type: string, example: Ingresso válido. Pode entrar. }
 *                 ticket:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     code:       { type: string }
 *                     seatLabel:  { type: string, nullable: true }
 *                     holderName: { type: string, nullable: true }
 *                     eventName:  { type: string, nullable: true }
 *                     eventDate:  { type: string, nullable: true }
 *                 validatedAt: { type: string, format: date-time }
 *             examples:
 *               valido:
 *                 value:
 *                   result: valid
 *                   message: Ingresso válido. Pode entrar.
 *                   ticket: { code: VP-A3S12-X7K9, seatLabel: 'Plateia A · Fileira B · Assento 7', holderName: Ana Ribeiro, eventName: Gala na Ópera, eventDate: '2026-11-15' }
 *                   validatedAt: '2026-11-15T19:42:10.000Z'
 *               jaUtilizado:
 *                 value:
 *                   result: already_used
 *                   message: Este ingresso já foi utilizado.
 *                   ticket: { code: VP-A3S12-X7K9, seatLabel: 'Plateia A · Fileira B · Assento 7', holderName: Ana Ribeiro, eventName: Gala na Ópera, eventDate: '2026-11-15' }
 *                   validatedAt: '2026-11-15T19:45:02.000Z'
 *               eventoErrado:
 *                 value:
 *                   result: wrong_event
 *                   message: Este ingresso não pertence a este evento.
 *                   ticket: { code: VP-B7K21-M3P8, seatLabel: Pista, holderName: Bruno Costa, eventName: Cinema no Jardim, eventDate: '2026-11-22' }
 *                   validatedAt: '2026-11-15T19:46:30.000Z'
 *               invalido:
 *                 value:
 *                   result: invalid
 *                   message: Ingresso inválido.
 *                   ticket: null
 *                   validatedAt: '2026-11-15T19:47:11.000Z'
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.post('/validate', roleGuard(UserRole.GATE), validateBody(ValidateTicketDTO), controller.validate)

/**
 * @openapi
 * /gate/tickets/{ticketId}/history:
 *   get:
 *     tags: [Gate]
 *     summary: Histórico de validações de um ingresso
 *     description: Auditoria — inclui as tentativas recusadas.
 *     parameters:
 *       - { in: path, name: ticketId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Histórico em ordem decrescente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:          { type: string, format: uuid }
 *                   result:      { $ref: '#/components/schemas/ValidationResult' }
 *                   validatedAt: { type: string, format: date-time }
 *                   validatedBy:
 *                     type: object
 *                     nullable: true
 *                     properties:
 *                       id:   { type: string, format: uuid }
 *                       name: { type: string }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/tickets/:ticketId/history', roleGuard(UserRole.GATE), controller.history)

export default router
