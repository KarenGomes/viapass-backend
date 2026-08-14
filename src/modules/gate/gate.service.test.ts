import type { DataSource, EntityManager } from 'typeorm'
import { TicketStatus, ValidationResult } from '../../shared/types/enums'
import { buildQrPayload, signTicket } from '../../shared/utils/qr-code.util'
import { GateService } from './gate.service'

/**
 * A portaria é o ponto onde uma falha vira prejuízo direto: aprovar duas vezes
 * é uma pessoa a mais na casa; recusar indevidamente é um cliente pagante na
 * porta. Os seis caminhos abaixo cobrem os quatro vereditos e as duas formas
 * de entrada (câmera e digitação).
 */

const SECRET = process.env.TICKET_HMAC_SECRET as string
const GATE_USER = 'gate-user-1'

interface TicketFixture {
  id: string
  code: string
  eventId: string
  status: TicketStatus
  seatLabel: string | null
}

function ticketFixture(overrides: Partial<TicketFixture> = {}): TicketFixture {
  return {
    id: 'ticket-1',
    code: 'VP-AAAAA-BBBB',
    eventId: 'event-1',
    status: TicketStatus.SOLD,
    seatLabel: 'Plateia A · Fileira B · Assento 7',
    ...overrides,
  }
}

/**
 * Dublê do DataSource que executa o callback da transação de imediato.
 * `insert` e `update` são espiões — é neles que verificamos o registro de
 * auditoria e a marcação do ingresso como usado.
 */
function serviceFor(ticket: TicketFixture | null) {
  const insert = jest.fn().mockResolvedValue(undefined)
  const update = jest.fn().mockResolvedValue({ affected: 1 })

  const hydrated = ticket
    ? { ...ticket, event: { name: 'Gala na Ópera', eventDate: '2026-11-15' }, owner: { name: 'Ana Ribeiro' } }
    : null

  const manager = {
    createQueryBuilder: jest.fn().mockReturnValue({
      setLock: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(ticket),
    }),
    findOneOrFail: jest.fn().mockResolvedValue(hydrated),
    insert,
    update,
  } as unknown as EntityManager

  const dataSource = {
    transaction: jest.fn((callback: (m: EntityManager) => unknown) => callback(manager)),
  } as unknown as DataSource

  return { service: new GateService(dataSource), insert, update }
}

function validQr(ticket: TicketFixture): string {
  return buildQrPayload(ticket.code, signTicket(ticket.id, ticket.code, SECRET))
}

describe('GateService.validate', () => {
  it('aprova ingresso pago lido pela câmera e o marca como utilizado', async () => {
    const ticket = ticketFixture()
    const { service, update } = serviceFor(ticket)

    const response = await service.validate(
      { payload: validQr(ticket), eventId: ticket.eventId },
      GATE_USER,
    )

    expect(response.result).toBe(ValidationResult.VALID)
    expect(response.message).toBe('Ingresso válido. Pode entrar.')
    expect(update).toHaveBeenCalledWith(
      expect.anything(),
      { id: ticket.id },
      { status: TicketStatus.USED },
    )
  })

  it('recusa ingresso já utilizado', async () => {
    const ticket = ticketFixture({ status: TicketStatus.USED })
    const { service, update } = serviceFor(ticket)

    const response = await service.validate(
      { payload: validQr(ticket), eventId: ticket.eventId },
      GATE_USER,
    )

    expect(response.result).toBe(ValidationResult.ALREADY_USED)
    // Não pode "re-marcar" — o estado do ingresso permanece intocado.
    expect(update).not.toHaveBeenCalled()
  })

  it('recusa ingresso de outro evento', async () => {
    const ticket = ticketFixture()
    const { service } = serviceFor(ticket)

    const response = await service.validate(
      { payload: validQr(ticket), eventId: 'outro-evento' },
      GATE_USER,
    )

    expect(response.result).toBe(ValidationResult.WRONG_EVENT)
  })

  it('recusa código inexistente', async () => {
    const { service } = serviceFor(null)

    const response = await service.validate({ payload: 'VP-ZZZZZ-9999' }, GATE_USER)

    expect(response.result).toBe(ValidationResult.INVALID)
    expect(response.ticket).toBeNull()
  })

  it('recusa assinatura forjada — é o requisito anti-falsificação', async () => {
    const ticket = ticketFixture()
    const { service, update } = serviceFor(ticket)

    const forged = buildQrPayload(ticket.code, '0'.repeat(64))
    const response = await service.validate({ payload: forged, eventId: ticket.eventId }, GATE_USER)

    expect(response.result).toBe(ValidationResult.INVALID)
    expect(update).not.toHaveBeenCalled()
  })

  it('aceita o código digitado à mão, sem assinatura', async () => {
    const ticket = ticketFixture()
    const { service } = serviceFor(ticket)

    const response = await service.validate(
      { payload: ticket.code, eventId: ticket.eventId },
      GATE_USER,
    )

    expect(response.result).toBe(ValidationResult.VALID)
  })

  it.each([TicketStatus.AVAILABLE, TicketStatus.RESERVED, TicketStatus.CANCELED])(
    'recusa ingresso com status %s — ninguém pagou por ele',
    async (status) => {
      const ticket = ticketFixture({ status })
      const { service } = serviceFor(ticket)

      const response = await service.validate(
        { payload: validQr(ticket), eventId: ticket.eventId },
        GATE_USER,
      )

      expect(response.result).toBe(ValidationResult.INVALID)
    },
  )

  it('devolve INVALID para payload vazio, sem tocar no banco', async () => {
    const { service, insert } = serviceFor(ticketFixture())

    const response = await service.validate({ payload: '   ' }, GATE_USER)

    expect(response.result).toBe(ValidationResult.INVALID)
    expect(insert).not.toHaveBeenCalled()
  })

  describe('auditoria', () => {
    it.each([
      ['aprovada', ticketFixture(), ValidationResult.VALID],
      ['já utilizada', ticketFixture({ status: TicketStatus.USED }), ValidationResult.ALREADY_USED],
      ['não paga', ticketFixture({ status: TicketStatus.RESERVED }), ValidationResult.INVALID],
    ])('registra a tentativa %s', async (_label, ticket, expected) => {
      const { service, insert } = serviceFor(ticket)

      await service.validate({ payload: validQr(ticket), eventId: ticket.eventId }, GATE_USER)

      expect(insert).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ticketId: ticket.id,
          validatedById: GATE_USER,
          result: expected,
        }),
      )
    })
  })

  it('devolve os dados do portador para conferência visual', async () => {
    const ticket = ticketFixture()
    const { service } = serviceFor(ticket)

    const response = await service.validate(
      { payload: validQr(ticket), eventId: ticket.eventId },
      GATE_USER,
    )

    expect(response.ticket).toMatchObject({
      code: ticket.code,
      seatLabel: ticket.seatLabel,
      holderName: 'Ana Ribeiro',
      eventName: 'Gala na Ópera',
    })
  })
})
