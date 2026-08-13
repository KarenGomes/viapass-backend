import type { EntityManager } from 'typeorm'
import { generateTicketCode, signTicket } from '../../shared/utils/qr-code.util'
import { generateId } from '../../shared/utils/token.util'
import { SeatType, TicketStatus } from '../../shared/types/enums'
import { Ticket } from './ticket.entity'
import type { Event, SeatMapConfig } from '../events/event.entity'

/** Quantos ingressos vão por INSERT. Acima disso o Postgres reclama de parâmetros. */
const INSERT_CHUNK = 500

/**
 * Cria o pool de ingressos de um evento.
 *
 * Roda uma única vez, na publicação. Depois disso a reserva apenas **atualiza**
 * o status destas linhas — nunca insere novas. (O MER §7.1 dizia INSERT, o que
 * conflitava com §6.2; ver docs/PROGRESSO.md.)
 *
 * Recebe o `EntityManager` da transação em curso: gerar ingressos e publicar o
 * evento precisam ser atômicos, ou um evento fica publicado sem lugar à venda.
 */
export class TicketPoolService {
  async generate(manager: EntityManager, event: Event): Promise<number> {
    const existing = await manager.count(Ticket, { where: { eventId: event.id } })

    // Idempotência: republicar não pode duplicar o pool.
    if (existing > 0) return existing

    const tickets =
      event.seatType === SeatType.MAPPED
        ? this.buildMappedTickets(event)
        : this.buildGeneralAdmissionTickets(event)

    for (let index = 0; index < tickets.length; index += INSERT_CHUNK) {
      await manager.insert(Ticket, tickets.slice(index, index + INSERT_CHUNK))
    }

    return tickets.length
  }

  /** Um ingresso por assento declarado no `seat_map_config`. */
  private buildMappedTickets(event: Event): Ticket[] {
    const config = event.seatMapConfig as SeatMapConfig | null
    const tickets: Ticket[] = []

    for (const section of config?.sections ?? []) {
      for (const row of section.rows) {
        for (let seat = 1; seat <= row.seats; seat += 1) {
          tickets.push(
            this.buildTicket(event.id, {
              seatSection: section.name,
              seatRow: row.label,
              seatNumber: seat,
              seatLabel: `${section.name} · Fileira ${row.label} · Assento ${seat}`,
            }),
          )
        }
      }
    }

    return tickets
  }

  /** Pista: ingressos sem lugar marcado, só quantidade. */
  private buildGeneralAdmissionTickets(event: Event): Ticket[] {
    return Array.from({ length: event.totalCapacity }, () =>
      this.buildTicket(event.id, {
        seatSection: null,
        seatRow: null,
        seatNumber: null,
        seatLabel: 'Pista',
      }),
    )
  }

  /**
   * O id é gerado aqui, e não pelo banco, porque a assinatura HMAC depende
   * dele. Deixar o Postgres gerar exigiria inserir, ler de volta e atualizar —
   * três operações por ingresso, num pool que pode ter milhares.
   */
  private buildTicket(
    eventId: string,
    seat: {
      seatSection: string | null
      seatRow: string | null
      seatNumber: number | null
      seatLabel: string
    },
  ): Ticket {
    const id = generateId()
    const code = generateTicketCode()

    return Object.assign(new Ticket(), {
      id,
      eventId,
      ownerId: null,
      code,
      qrHash: signTicket(id, code),
      status: TicketStatus.AVAILABLE,
      ...seat,
    })
  }
}
