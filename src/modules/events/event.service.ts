import { Brackets, type DataSource, type Repository } from 'typeorm'
import { AppError } from '../../shared/errors/app-error'
import { ResponseErrors } from '../../shared/errors/response-errors'
import { StatusErrors } from '../../shared/errors/status-errors'
import { EventStatus, SeatType, TicketStatus } from '../../shared/types/enums'
import {
  paginate,
  type Paginated,
  type PaginationParams,
} from '../../shared/utils/pagination.util'
import type { AttractionService } from '../attractions/attraction.service'
import type { ClassificationService } from '../classifications/classification.service'
import type { TicketPoolService } from '../tickets/ticket-pool.service'
import type { VenueService } from '../venues/venue.service'
import { Ticket } from '../tickets/ticket.entity'
import { mapEvent } from '../catalog/ticketmaster.mapper'
import type { NormalizedEvent } from '../catalog/ticketmaster.mapper'
import type { TicketmasterClient } from '../catalog/ticketmaster.client'
import { Event, type SeatMapConfig } from './event.entity'
import { EventImage } from './event-image.entity'
import { PriceRange } from './price-range.entity'
import type { CreateEventDTO, UpdateEventDTO } from './event.dto'

export interface ListEventsFilters {
  search?: string
  city?: string
  segment?: string
  dateFrom?: string
  dateTo?: string
  /** Só o organizador dono enxerga rascunhos; para o público é sempre false. */
  includeUnpublished?: boolean
  organizerId?: string
}

/** Status em que o evento aparece para o público. */
const PUBLIC_STATUSES: EventStatus[] = [
  EventStatus.PUBLISHED,
  EventStatus.ONSALE,
  EventStatus.OFFSALE,
]

/** Status em que o evento aceita compra. */
const SELLABLE_STATUSES: EventStatus[] = [EventStatus.PUBLISHED, EventStatus.ONSALE]

export class EventService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly events: Repository<Event>,
    private readonly venues: VenueService,
    private readonly attractions: AttractionService,
    private readonly classifications: ClassificationService,
    private readonly pool: TicketPoolService,
    private readonly ticketmaster: TicketmasterClient,
  ) {}

  // ── Leitura ────────────────────────────────────────────────────────────

  async list(filters: ListEventsFilters, pagination: PaginationParams): Promise<Paginated<Event>> {
    const query = this.events
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.venue', 'venue')
      .leftJoinAndSelect('event.classification', 'classification')
      .leftJoinAndSelect('event.images', 'images')

    if (!filters.includeUnpublished) {
      query.andWhere('event.status IN (:...statuses)', { statuses: PUBLIC_STATUSES })
    }

    if (filters.organizerId) {
      query.andWhere('event.organizerId = :organizerId', { organizerId: filters.organizerId })
    }

    if (filters.search) {
      // ILIKE cobre acento? Não — cobre só maiúsculas/minúsculas. Busca com
      // acento-insensível exigiria a extensão unaccent; ver NEXT-STEPS.
      query.andWhere(
        new Brackets((where) => {
          where
            .where('event.name ILIKE :search', { search: `%${filters.search}%` })
            .orWhere('event.description ILIKE :search', { search: `%${filters.search}%` })
        }),
      )
    }

    if (filters.city) {
      query.andWhere('venue.city ILIKE :city', { city: `%${filters.city}%` })
    }

    if (filters.segment) {
      query.andWhere('classification.segmentName ILIKE :segment', {
        segment: `%${filters.segment}%`,
      })
    }

    if (filters.dateFrom) {
      query.andWhere('event.eventDate >= :dateFrom', { dateFrom: filters.dateFrom })
    }

    if (filters.dateTo) {
      query.andWhere('event.eventDate <= :dateTo', { dateTo: filters.dateTo })
    }

    query.orderBy('event.eventDate', 'ASC').addOrderBy('event.eventTime', 'ASC')

    /**
     * `getManyAndCount` com `leftJoinAndSelect` de coleção pagina errado no SQL
     * puro (o LIMIT corta linhas do JOIN, não eventos). O TypeORM resolve isso
     * com uma query de ids em separado quando `skip`/`take` são usados — por
     * isso `skip`/`take` e não `offset`/`limit`.
     */
    const [data, total] = await query.skip(pagination.skip).take(pagination.take).getManyAndCount()

    return paginate(data, total, pagination)
  }

  async findById(id: string, options: { includeUnpublished?: boolean } = {}): Promise<Event> {
    const event = await this.events.findOne({
      where: { id },
      relations: {
        venue: true,
        classification: true,
        images: true,
        priceRanges: true,
        attractions: true,
        organizer: true,
      },
    })

    if (!event) {
      throw new AppError(StatusErrors.NOT_FOUND, ResponseErrors.EVENT_NOT_FOUND)
    }

    // Rascunho não existe para quem não é o dono — 404, não 403: revelar que
    // o evento existe já é informação.
    if (!options.includeUnpublished && !PUBLIC_STATUSES.includes(event.status)) {
      throw new AppError(StatusErrors.NOT_FOUND, ResponseErrors.EVENT_NOT_FOUND)
    }

    return event
  }

  /** Contagem real de ingressos livres — a fonte de verdade, não o contador. */
  async countAvailableTickets(eventId: string): Promise<number> {
    return this.dataSource
      .getRepository(Ticket)
      .createQueryBuilder('ticket')
      .where('ticket.event_id = :eventId', { eventId })
      .andWhere('ticket.status = :status', { status: TicketStatus.AVAILABLE })
      .getCount()
  }

  /**
   * Mapa de ocupação do evento.
   *
   * É o que o front precisa para desenhar a seleção de assentos: qual lugar
   * existe, se está livre e qual o preço da seção.
   *
   * Devolve apenas `id`, posição e disponibilidade — **nunca** `code` nem
   * `qr_hash`. Expor o código de um ingresso à venda permitiria tentar entrar
   * no evento com um assento que ninguém comprou.
   */
  async seatMap(eventId: string): Promise<{
    seatType: SeatType
    availableCount: number
    totalCount: number
    seats: Array<{
      id: string
      section: string | null
      row: string | null
      number: number | null
      label: string | null
      price: number | null
      available: boolean
    }>
  }> {
    const event = await this.findById(eventId)

    const tickets = await this.dataSource.getRepository(Ticket).find({
      where: { eventId },
      order: { seatSection: 'ASC', seatRow: 'ASC', seatNumber: 'ASC' },
    })

    const priceBySection = new Map(
      (event.seatMapConfig?.sections ?? []).map((section) => [section.name, section.price]),
    )

    const seats = tickets.map((ticket) => ({
      id: ticket.id,
      section: ticket.seatSection,
      row: ticket.seatRow,
      number: ticket.seatNumber,
      label: ticket.seatLabel,
      price:
        priceBySection.get(ticket.seatSection ?? '') ??
        event.seatMapConfig?.sections[0]?.price ??
        null,
      available: ticket.status === TicketStatus.AVAILABLE,
    }))

    return {
      seatType: event.seatType,
      availableCount: seats.filter((seat) => seat.available).length,
      totalCount: seats.length,
      /**
       * Em pista não faz sentido listar 150 ingressos idênticos — o cliente
       * escolhe quantidade, não lugar. Devolvemos só a contagem.
       */
      seats: event.seatType === SeatType.MAPPED ? seats : [],
    }
  }

  // ── Escrita ────────────────────────────────────────────────────────────

  async create(dto: CreateEventDTO, organizerId: string): Promise<Event> {
    const capacity = this.resolveCapacity(dto.seatType, dto.totalCapacity, dto.seatMapConfig)
    const venue = await this.venues.findOrCreate({
      tmVenueId: null,
      name: dto.venue.name,
      addressLine1: dto.venue.addressLine1 ?? null,
      city: dto.venue.city ?? null,
      stateCode: dto.venue.stateCode ?? null,
      countryCode: dto.venue.countryCode ?? null,
      postalCode: dto.venue.postalCode ?? null,
      timezone: dto.venue.timezone ?? null,
      latitude: null,
      longitude: null,
    })

    const event = this.events.create({
      name: dto.name,
      description: dto.description ?? null,
      venueId: venue.id,
      organizerId,
      eventDate: dto.eventDate,
      eventTime: dto.eventTime ?? null,
      eventDatetime: null,
      status: EventStatus.DRAFT,
      totalCapacity: capacity,
      availableCapacity: capacity,
      seatType: dto.seatType,
      seatMapConfig: this.buildSeatMapConfig(dto.seatType, dto.seatMapConfig, dto.price),
      seatmapUrl: null,
      saleStart: dto.saleStart ? new Date(dto.saleStart) : null,
      saleEnd: dto.saleEnd ? new Date(dto.saleEnd) : null,
    })

    return this.events.save(event)
  }

  /**
   * Importa um evento da Ticketmaster como rascunho.
   *
   * O evento importado **não** nasce publicado: falta o que a API externa não
   * fornece — capacidade, layout de assentos e preço de venda. Ver MER §6.1.
   */
  async importFromCatalog(tmEventId: string, organizerId: string): Promise<Event> {
    const duplicate = await this.events.findOne({ where: { tmEventId } })

    if (duplicate) {
      throw new AppError(StatusErrors.CONFLICT, ResponseErrors.EVENT_ALREADY_IMPORTED)
    }

    const normalized = mapEvent(await this.ticketmaster.getEvent(tmEventId))

    if (!normalized) {
      throw new AppError(StatusErrors.UNPROCESSABLE, {
        msg: 'Evento da Ticketmaster sem nome ou data — não é possível importar',
      })
    }

    return this.persistImported(normalized, organizerId)
  }

  /**
   * Persiste um evento já normalizado. Separado da chamada HTTP para que a
   * seed reaproveite exatamente o mesmo caminho, com fixtures em vez de rede.
   */
  async persistImported(normalized: NormalizedEvent, organizerId: string): Promise<Event> {
    if (!normalized.venue) {
      throw new AppError(StatusErrors.UNPROCESSABLE, {
        msg: 'Evento da Ticketmaster sem local definido — não é possível importar',
      })
    }

    return this.dataSource.transaction(async (manager) => {
      const venue = await this.venues.findOrCreate(normalized.venue!)
      const classification = normalized.classification
        ? await this.classifications.findOrCreate(normalized.classification)
        : null
      const attractions = await this.attractions.findOrCreateMany(normalized.attractions)

      const event = manager.create(Event, {
        tmEventId: normalized.tmEventId,
        name: normalized.name,
        description: normalized.description,
        venueId: venue.id,
        organizerId,
        classificationId: classification?.id ?? null,
        eventDate: normalized.eventDate,
        eventTime: normalized.eventTime,
        eventDatetime: normalized.eventDatetime,
        // Rascunho sempre: capacidade e preço ainda não existem.
        status: EventStatus.DRAFT,
        // Capacidade provisória de 1 — o CHECK exige > 0. O organizador
        // define a real antes de publicar.
        totalCapacity: 1,
        availableCapacity: 1,
        seatType: SeatType.GENERAL_ADMISSION,
        seatMapConfig: null,
        seatmapUrl: normalized.seatmapUrl,
        attractions,
      })

      const saved = await manager.save(Event, event)

      if (normalized.images.length > 0) {
        await manager.insert(
          EventImage,
          normalized.images.map((image) => ({ ...image, eventId: saved.id })),
        )
      }

      if (normalized.priceRanges.length > 0) {
        await manager.insert(
          PriceRange,
          normalized.priceRanges.map((range) => ({ ...range, eventId: saved.id })),
        )
      }

      return saved
    })
  }

  async update(id: string, dto: UpdateEventDTO, organizerId: string): Promise<Event> {
    const event = await this.findOwned(id, organizerId)
    const isPublished = event.status !== EventStatus.DRAFT

    /**
     * Capacidade e layout são imutáveis depois da publicação. O pool de
     * ingressos já existe e pode ter vendas — mexer aqui deixaria o mapa de
     * assentos e os ingressos emitidos discordando um do outro.
     */
    const touchesLayout =
      dto.totalCapacity !== undefined || dto.seatMapConfig !== undefined || dto.price !== undefined

    if (isPublished && touchesLayout) {
      throw new AppError(StatusErrors.CONFLICT, {
        msg: 'Capacidade, preço e mapa de assentos não podem mudar após a publicação',
      })
    }

    if (dto.name !== undefined) event.name = dto.name
    if (dto.description !== undefined) event.description = dto.description
    if (dto.eventDate !== undefined) event.eventDate = dto.eventDate
    if (dto.eventTime !== undefined) event.eventTime = dto.eventTime
    if (dto.saleStart !== undefined) event.saleStart = new Date(dto.saleStart)
    if (dto.saleEnd !== undefined) event.saleEnd = new Date(dto.saleEnd)

    if (!isPublished && touchesLayout) {
      const capacity = this.resolveCapacity(
        event.seatType,
        dto.totalCapacity ?? event.totalCapacity,
        dto.seatMapConfig,
      )

      event.totalCapacity = capacity
      event.availableCapacity = capacity

      if (dto.seatMapConfig || dto.price !== undefined) {
        event.seatMapConfig = this.buildSeatMapConfig(
          event.seatType,
          dto.seatMapConfig,
          dto.price ?? this.firstSectionPrice(event.seatMapConfig),
        )
      }
    }

    if (dto.status !== undefined) {
      this.assertStatusTransition(event.status, dto.status)
      event.status = dto.status
    }

    return this.events.save(event)
  }

  /**
   * Publica o evento e gera o pool de ingressos, na mesma transação.
   *
   * Separar as duas coisas deixaria uma janela em que o evento está visível e
   * comprável sem ter um único ingresso — e o cliente veria "esgotado" num
   * evento recém-publicado.
   */
  async publish(id: string, organizerId: string): Promise<{ event: Event; ticketsCreated: number }> {
    const event = await this.findOwned(id, organizerId)

    if (event.status === EventStatus.CANCELED) {
      throw new AppError(StatusErrors.CONFLICT, ResponseErrors.EVENT_CANCELED)
    }

    if (event.seatType === SeatType.MAPPED && !event.seatMapConfig) {
      throw new AppError(StatusErrors.UNPROCESSABLE, {
        msg: 'Defina o mapa de assentos antes de publicar',
      })
    }

    return this.dataSource.transaction(async (manager) => {
      const ticketsCreated = await this.pool.generate(manager, event)

      event.status = EventStatus.ONSALE
      event.availableCapacity = ticketsCreated
      event.totalCapacity = ticketsCreated

      const saved = await manager.save(Event, event)

      return { event: saved, ticketsCreated }
    })
  }

  /**
   * Cancela o evento. Não apaga: pedidos e ingressos apontam para ele e o
   * histórico precisa sobreviver.
   */
  async cancel(id: string, organizerId: string): Promise<Event> {
    const event = await this.findOwned(id, organizerId)

    event.status = EventStatus.CANCELED
    event.availableCapacity = 0

    return this.events.save(event)
  }

  /**
   * Remove o evento — só enquanto for rascunho sem ingressos.
   *
   * Depois disso, apagar destruiria pedidos pagos; a operação correta passa a
   * ser cancelar.
   */
  async remove(id: string, organizerId: string): Promise<void> {
    const event = await this.findOwned(id, organizerId)

    if (event.status !== EventStatus.DRAFT) {
      throw new AppError(StatusErrors.CONFLICT, {
        msg: 'Apenas eventos em rascunho podem ser excluídos. Cancele o evento.',
      })
    }

    const sold = await this.dataSource
      .getRepository('tickets')
      .createQueryBuilder('ticket')
      .where('ticket.event_id = :id', { id })
      .andWhere('ticket.status <> :available', { available: TicketStatus.AVAILABLE })
      .getCount()

    if (sold > 0) {
      throw new AppError(StatusErrors.CONFLICT, {
        msg: 'Este evento já possui ingressos reservados ou vendidos',
      })
    }

    await this.events.delete({ id })
  }

  // ── Regras auxiliares ──────────────────────────────────────────────────

  /** Garante que o evento existe e que quem pede é o organizador dono. */
  async findOwned(id: string, organizerId: string): Promise<Event> {
    const event = await this.events.findOne({ where: { id } })

    if (!event) {
      throw new AppError(StatusErrors.NOT_FOUND, ResponseErrors.EVENT_NOT_FOUND)
    }

    if (event.organizerId !== organizerId) {
      throw new AppError(StatusErrors.FORBIDDEN, ResponseErrors.EVENT_NOT_OWNER)
    }

    return event
  }

  /** Lança se o evento não estiver aceitando compra. Usado pelo checkout. */
  assertSellable(event: Event): void {
    if (event.status === EventStatus.CANCELED) {
      throw new AppError(StatusErrors.CONFLICT, ResponseErrors.EVENT_CANCELED)
    }

    if (!SELLABLE_STATUSES.includes(event.status)) {
      throw new AppError(StatusErrors.UNPROCESSABLE, ResponseErrors.EVENT_NOT_ONSALE)
    }

    const now = new Date()

    if (event.saleStart && now < event.saleStart) {
      throw new AppError(StatusErrors.UNPROCESSABLE, ResponseErrors.EVENT_NOT_ONSALE)
    }

    if (event.saleEnd && now > event.saleEnd) {
      throw new AppError(StatusErrors.UNPROCESSABLE, ResponseErrors.EVENT_NOT_ONSALE)
    }
  }

  /**
   * Em mapa de assentos a capacidade é a soma dos lugares declarados; em pista
   * é o número informado. Aceitar os dois independentes permitiria criar um
   * evento cuja capacidade não bate com o mapa.
   */
  private resolveCapacity(
    seatType: SeatType,
    totalCapacity: number | undefined,
    config: { sections: Array<{ rows: Array<{ seats: number }> }> } | undefined,
  ): number {
    if (seatType === SeatType.MAPPED) {
      if (!config) {
        throw new AppError(StatusErrors.BAD_REQUEST, {
          msg: 'Evento com mapa de assentos exige seatMapConfig',
        })
      }

      const seats = config.sections.reduce(
        (total, section) => total + section.rows.reduce((sum, row) => sum + row.seats, 0),
        0,
      )

      if (seats <= 0) {
        throw new AppError(StatusErrors.BAD_REQUEST, {
          msg: 'O mapa de assentos precisa declarar ao menos um lugar',
        })
      }

      return seats
    }

    if (!totalCapacity) {
      throw new AppError(StatusErrors.BAD_REQUEST, {
        msg: 'Evento de pista exige totalCapacity',
      })
    }

    return totalCapacity
  }

  /** Pista vira uma seção única, para o preço ficar num lugar só nos dois modos. */
  private buildSeatMapConfig(
    seatType: SeatType,
    config: SeatMapConfig | undefined,
    price: number | undefined,
  ): SeatMapConfig | null {
    if (seatType === SeatType.MAPPED) return config ?? null

    if (price === undefined) return null

    return { sections: [{ name: 'Pista', rows: [], price }] }
  }

  private firstSectionPrice(config: SeatMapConfig | null): number | undefined {
    return config?.sections[0]?.price
  }

  /** Rascunho não vai direto a "concluído", e cancelado não volta atrás. */
  private assertStatusTransition(current: EventStatus, next: EventStatus): void {
    if (current === EventStatus.CANCELED && next !== EventStatus.CANCELED) {
      throw new AppError(StatusErrors.CONFLICT, ResponseErrors.EVENT_CANCELED)
    }

    if (current === EventStatus.DRAFT && next !== EventStatus.DRAFT && next !== EventStatus.CANCELED) {
      throw new AppError(StatusErrors.CONFLICT, {
        msg: 'Use POST /events/:id/publish para publicar um rascunho',
      })
    }
  }
}
