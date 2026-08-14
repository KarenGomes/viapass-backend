import type { DataSource, EntityManager } from 'typeorm'
import { TicketStatus, ValidationResult } from '../../shared/types/enums'
import { parseQrPayload, verifyTicketSignature } from '../../shared/utils/qr-code.util'
import { Ticket } from '../tickets/ticket.entity'
import { TicketValidation } from './ticket-validation.entity'
import type { ValidateTicketDTO } from './gate.dto'

export interface GateResponse {
  result: ValidationResult
  message: string
  ticket: {
    code: string
    seatLabel: string | null
    holderName: string | null
    eventName: string | null
    eventDate: string | null
  } | null
  validatedAt: string
}

/** Mensagem de cada veredito. Uma por resultado, sem ambiguidade na portaria. */
const MESSAGES: Record<ValidationResult, string> = {
  [ValidationResult.VALID]: 'Ingresso válido. Pode entrar.',
  [ValidationResult.INVALID]: 'Ingresso inválido.',
  [ValidationResult.ALREADY_USED]: 'Este ingresso já foi utilizado.',
  [ValidationResult.WRONG_EVENT]: 'Este ingresso não pertence a este evento.',
}

/**
 * Validação de ingresso na portaria.
 *
 * Devolve **sempre 200** com o veredito no corpo, mesmo quando o ingresso é
 * recusado. Uma leitura recusada não é erro de requisição: a portaria fez tudo
 * certo e a resposta é "não pode entrar". Tratar isso como 4xx obrigaria o
 * front a ler exceções para exibir um resultado esperado.
 *
 * Toda tentativa é registrada em `ticket_validations`, inclusive as recusadas
 * (MER §3.12) — é o histórico que responde depois quem tentou entrar com um
 * ingresso já usado.
 */
export class GateService {
  constructor(private readonly dataSource: DataSource) {}

  async validate(dto: ValidateTicketDTO, gateUserId: string): Promise<GateResponse> {
    const parsed = parseQrPayload(dto.payload)

    if (!parsed) {
      return this.respond(ValidationResult.INVALID, null)
    }

    return this.dataSource.transaction(async (manager) => {
      /**
       * `FOR UPDATE` trava a linha até o fim da transação. É o que impede que
       * duas portarias lendo o mesmo ingresso ao mesmo tempo aprovem as duas:
       * a segunda espera, relê o status já marcado como `used` e recusa.
       *
       * O lock vem numa query **sem JOIN**: o Postgres recusa `FOR UPDATE`
       * sobre o lado anulável de um LEFT JOIN (`0A000`), e tanto `event`
       * quanto `owner` entram por LEFT JOIN. As relações são carregadas na
       * sequência, já com a linha travada — a leitura continua consistente.
       */
      const locked = await manager
        .createQueryBuilder(Ticket, 'ticket')
        .setLock('pessimistic_write')
        .where('ticket.code = :code', { code: parsed.code })
        .getOne()

      if (!locked) {
        return this.respond(ValidationResult.INVALID, null)
      }

      const ticket = await manager.findOneOrFail(Ticket, {
        where: { id: locked.id },
        relations: { event: true, owner: true },
      })

      /**
       * Se veio assinatura (leitura por câmera), ela precisa conferir. Código
       * digitado à mão não tem assinatura, e nesse caso a existência no banco
       * é a validação — o código tem entropia suficiente para não ser
       * adivinhado, e a portaria é presencial.
       */
      if (parsed.signature !== '') {
        const authentic = verifyTicketSignature(ticket.id, ticket.code, parsed.signature)

        if (!authentic) {
          await this.log(manager, ticket.id, gateUserId, ValidationResult.INVALID)
          return this.respond(ValidationResult.INVALID, ticket)
        }
      }

      if (dto.eventId && ticket.eventId !== dto.eventId) {
        await this.log(manager, ticket.id, gateUserId, ValidationResult.WRONG_EVENT)
        return this.respond(ValidationResult.WRONG_EVENT, ticket)
      }

      if (ticket.status === TicketStatus.USED) {
        await this.log(manager, ticket.id, gateUserId, ValidationResult.ALREADY_USED)
        return this.respond(ValidationResult.ALREADY_USED, ticket)
      }

      // Só ingresso pago entra. `available`, `reserved` e `canceled` são
      // inválidos: ninguém pagou por eles.
      if (ticket.status !== TicketStatus.SOLD) {
        await this.log(manager, ticket.id, gateUserId, ValidationResult.INVALID)
        return this.respond(ValidationResult.INVALID, ticket)
      }

      await manager.update(Ticket, { id: ticket.id }, { status: TicketStatus.USED })
      await this.log(manager, ticket.id, gateUserId, ValidationResult.VALID)

      return this.respond(ValidationResult.VALID, ticket)
    })
  }

  /** Histórico de validações de um ingresso — auditoria da portaria. */
  async history(ticketId: string): Promise<TicketValidation[]> {
    return this.dataSource.getRepository(TicketValidation).find({
      where: { ticketId },
      relations: { validatedBy: true },
      order: { validatedAt: 'DESC' },
    })
  }

  private async log(
    manager: EntityManager,
    ticketId: string,
    validatedById: string,
    result: ValidationResult,
  ): Promise<void> {
    await manager.insert(TicketValidation, { ticketId, validatedById, result })
  }

  private respond(result: ValidationResult, ticket: Ticket | null): GateResponse {
    return {
      result,
      message: MESSAGES[result],
      ticket: ticket
        ? {
            code: ticket.code,
            seatLabel: ticket.seatLabel,
            holderName: ticket.owner?.name ?? null,
            eventName: ticket.event?.name ?? null,
            eventDate: ticket.event?.eventDate ?? null,
          }
        : null,
      validatedAt: new Date().toISOString(),
    }
  }
}
