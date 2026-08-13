import { In, type DataSource, type EntityManager, type Repository } from 'typeorm'
import { AppError } from '../../shared/errors/app-error'
import { ResponseErrors } from '../../shared/errors/response-errors'
import { StatusErrors } from '../../shared/errors/status-errors'
import { OrderStatus, SeatType, TicketStatus } from '../../shared/types/enums'
import {
  paginate,
  type Paginated,
  type PaginationParams,
} from '../../shared/utils/pagination.util'
import { Event } from '../events/event.entity'
import type { EventService } from '../events/event.service'
import { Ticket } from '../tickets/ticket.entity'
import { Order } from './order.entity'
import { OrderItem } from './order-item.entity'
import type { CreateOrderDTO, PayOrderDTO } from './order.dto'
import type { PaymentService } from './payment.service'

export class OrderService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orders: Repository<Order>,
    private readonly events: EventService,
    private readonly payments: PaymentService,
  ) {}

  /**
   * Cria o pedido e reserva os ingressos, numa transação só.
   *
   * A garantia contra sobrevenda está em dois UPDATEs condicionais, não em
   * verificações prévias. Um `SELECT` que confirma disponibilidade e depois um
   * `UPDATE` sem condição é a receita clássica da corrida: entre os dois,
   * outro pedido leva o assento.
   *
   * Ver docs/rules/03-banco-de-dados.md.
   */
  async create(dto: CreateOrderDTO, userId: string): Promise<Order> {
    /**
     * A transação devolve só o id; a leitura completa acontece **depois** do
     * commit.
     *
     * Ler de dentro com `this.orders` — o repositório comum — usaria outra
     * conexão, que não enxerga o que a transação ainda não commitou: o pedido
     * recém-criado voltava como "não encontrado".
     */
    const orderId = await this.dataSource.transaction(async (manager) => {
      const event = await manager.findOne(Event, { where: { id: dto.eventId } })

      if (!event) {
        throw new AppError(StatusErrors.NOT_FOUND, ResponseErrors.EVENT_NOT_FOUND)
      }

      this.events.assertSellable(event)

      const tickets =
        event.seatType === SeatType.MAPPED
          ? await this.reserveChosenSeats(manager, event, dto, userId)
          : await this.reserveAnySeats(manager, event, dto, userId)

      const unitPrice = this.priceFor(event, tickets[0]?.seatSection ?? null)
      const total = (unitPrice * tickets.length).toFixed(2)

      const order = await manager.save(
        manager.create(Order, {
          userId,
          eventId: event.id,
          status: OrderStatus.PENDING,
          totalAmount: total,
          currency: 'BRL',
        }),
      )

      await manager.insert(
        OrderItem,
        tickets.map((ticket) => ({
          orderId: order.id,
          ticketId: ticket.id,
          unitPrice: this.priceFor(event, ticket.seatSection).toFixed(2),
          seatLabel: ticket.seatLabel,
        })),
      )

      return order.id
    })

    return this.findByIdOrFail(orderId, userId)
  }

  /**
   * Processa o pagamento simulado.
   *
   * Aprovado: ingressos viram `sold` e o pedido `paid`.
   * Recusado: o pedido vira `failed` e os ingressos **voltam ao pool** — reter
   * assento de uma compra recusada é o mesmo que perdê-lo, e o cliente
   * consegue tentar de novo com outro cartão.
   */
  async pay(orderId: string, dto: PayOrderDTO, userId: string): Promise<Order> {
    /**
     * A recusa é devolvida como valor, não lançada de dentro da transação.
     *
     * Lançar ali faria rollback exatamente do que precisa sobreviver: o pedido
     * marcado como `failed` e os ingressos devolvidos ao pool. O cliente
     * receberia o erro, e o banco ficaria como se a tentativa nunca tivesse
     * existido — com os assentos presos a um pedido pendente.
     *
     * As validações acima (pedido inexistente, de outro dono, já pago) podem
     * lançar normalmente: não há nada persistido para preservar.
     */
    const declineReason = await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        relations: { items: true },
      })

      if (!order) {
        throw new AppError(StatusErrors.NOT_FOUND, ResponseErrors.ORDER_NOT_FOUND)
      }

      if (order.userId !== userId) {
        throw new AppError(StatusErrors.FORBIDDEN, ResponseErrors.ORDER_NOT_OWNER)
      }

      if (order.status === OrderStatus.PAID) {
        throw new AppError(StatusErrors.CONFLICT, ResponseErrors.ORDER_ALREADY_PAID)
      }

      if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.FAILED) {
        throw new AppError(StatusErrors.CONFLICT, {
          msg: 'Este pedido não pode mais ser pago',
        })
      }

      const result = this.payments.process({
        amount: order.totalAmount,
        method: dto.paymentMethod,
        cardNumber: dto.cardNumber,
      })

      const ticketIds = order.items.map((item) => item.ticketId)

      order.paymentMethod = dto.paymentMethod
      order.paymentId = result.paymentId

      if (!result.approved) {
        order.status = OrderStatus.FAILED
        await manager.save(order)
        await this.releaseTickets(manager, order.id, order.eventId, ticketIds)

        return result.reason ?? ResponseErrors.PAYMENT_FAILED.msg
      }

      order.status = OrderStatus.PAID
      order.paidAt = new Date()
      await manager.save(order)

      await manager.update(
        Ticket,
        { id: In(ticketIds), status: TicketStatus.RESERVED },
        { status: TicketStatus.SOLD },
      )

      return null
    })

    if (declineReason) {
      throw new AppError(StatusErrors.UNPROCESSABLE, { msg: declineReason })
    }

    return this.findByIdOrFail(orderId, userId)
  }

  /**
   * Cancela o pedido e devolve os ingressos ao pool.
   *
   * Ingresso já utilizado bloqueia o cancelamento: a pessoa entrou no evento,
   * e devolver o lugar ao estoque criaria um assento fantasma disponível.
   */
  async cancel(orderId: string, userId: string): Promise<Order> {
    // Leitura completa só após o commit — ver a nota em `create`.
    await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        relations: { items: { ticket: true } },
      })

      if (!order) {
        throw new AppError(StatusErrors.NOT_FOUND, ResponseErrors.ORDER_NOT_FOUND)
      }

      if (order.userId !== userId) {
        throw new AppError(StatusErrors.FORBIDDEN, ResponseErrors.ORDER_NOT_OWNER)
      }

      if (order.status === OrderStatus.CANCELED || order.status === OrderStatus.REFUNDED) {
        throw new AppError(StatusErrors.CONFLICT, { msg: 'Este pedido já foi cancelado' })
      }

      const used = order.items.filter((item) => item.ticket?.status === TicketStatus.USED)

      if (used.length > 0) {
        throw new AppError(StatusErrors.CONFLICT, {
          msg: 'Não é possível cancelar: um dos ingressos já foi utilizado',
        })
      }

      const wasPaid = order.status === OrderStatus.PAID

      order.status = wasPaid ? OrderStatus.REFUNDED : OrderStatus.CANCELED
      await manager.save(order)

      await this.releaseTickets(
        manager,
        order.id,
        order.eventId,
        order.items.map((item) => item.ticketId),
      )
    })

    return this.findByIdOrFail(orderId, userId)
  }

  async listMine(userId: string, pagination: PaginationParams): Promise<Paginated<Order>> {
    const [data, total] = await this.orders.findAndCount({
      where: { userId },
      relations: { event: { venue: true }, items: { ticket: true } },
      order: { createdAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.take,
    })

    return paginate(data, total, pagination)
  }

  async findByIdOrFail(orderId: string, userId: string): Promise<Order> {
    const order = await this.orders.findOne({
      where: { id: orderId },
      relations: { event: { venue: true }, items: { ticket: true } },
    })

    if (!order) {
      throw new AppError(StatusErrors.NOT_FOUND, ResponseErrors.ORDER_NOT_FOUND)
    }

    if (order.userId !== userId) {
      throw new AppError(StatusErrors.FORBIDDEN, ResponseErrors.ORDER_NOT_OWNER)
    }

    return order
  }

  // ── Reserva ────────────────────────────────────────────────────────────

  /** Mapa de assentos: o cliente escolheu lugares específicos. */
  private async reserveChosenSeats(
    manager: EntityManager,
    event: Event,
    dto: CreateOrderDTO,
    userId: string,
  ): Promise<Ticket[]> {
    if (!dto.ticketIds?.length) {
      throw new AppError(StatusErrors.BAD_REQUEST, {
        msg: 'Este evento exige a seleção dos assentos (ticketIds)',
      })
    }

    const quantity = dto.ticketIds.length

    await this.decrementCapacity(manager, event.id, quantity)

    /**
     * O `WHERE status = 'available'` é o que impede a venda dupla: se outro
     * pedido reservou o assento entre a leitura da tela e este UPDATE, a linha
     * não bate mais e o contador de afetadas vem menor.
     */
    const updated = await manager
      .createQueryBuilder()
      .update(Ticket)
      .set({ status: TicketStatus.RESERVED, ownerId: userId })
      .where('id IN (:...ids)', { ids: dto.ticketIds })
      .andWhere('event_id = :eventId', { eventId: event.id })
      .andWhere('status = :available', { available: TicketStatus.AVAILABLE })
      .execute()

    if (updated.affected !== quantity) {
      // Desfaz tudo — inclusive o decremento de capacidade já aplicado.
      throw new AppError(StatusErrors.CONFLICT, ResponseErrors.SEAT_TAKEN)
    }

    return manager.find(Ticket, { where: { id: In(dto.ticketIds) } })
  }

  /** Pista: o sistema escolhe quaisquer N ingressos livres. */
  private async reserveAnySeats(
    manager: EntityManager,
    event: Event,
    dto: CreateOrderDTO,
    userId: string,
  ): Promise<Ticket[]> {
    const quantity = dto.quantity ?? dto.ticketIds?.length

    if (!quantity) {
      throw new AppError(StatusErrors.BAD_REQUEST, {
        msg: 'Informe a quantidade de ingressos (quantity)',
      })
    }

    await this.decrementCapacity(manager, event.id, quantity)

    /**
     * `SKIP LOCKED` faz cada pedido concorrente pegar linhas diferentes em vez
     * de esperar na fila pelas mesmas. Sem ele, dez compras simultâneas
     * disputariam os mesmos dez primeiros ingressos e nove ficariam bloqueadas.
     */
    const candidates = await manager
      .createQueryBuilder(Ticket, 'ticket')
      .setLock('pessimistic_write')
      .setOnLocked('skip_locked')
      .where('ticket.event_id = :eventId', { eventId: event.id })
      .andWhere('ticket.status = :available', { available: TicketStatus.AVAILABLE })
      .orderBy('ticket.created_at', 'ASC')
      .limit(quantity)
      .getMany()

    if (candidates.length < quantity) {
      throw new AppError(StatusErrors.CONFLICT, ResponseErrors.SOLD_OUT)
    }

    const ids = candidates.map((ticket) => ticket.id)

    await manager.update(
      Ticket,
      { id: In(ids), status: TicketStatus.AVAILABLE },
      { status: TicketStatus.RESERVED, ownerId: userId },
    )

    return manager.find(Ticket, { where: { id: In(ids) } })
  }

  /**
   * Decrementa a capacidade de forma atômica.
   *
   * `WHERE available_capacity >= :quantity` é avaliado sob lock de linha pelo
   * Postgres. Dois pedidos simultâneos serializam aqui, e o segundo enxerga o
   * valor já decrementado — que é exatamente o que impede a sobrevenda.
   */
  private async decrementCapacity(
    manager: EntityManager,
    eventId: string,
    quantity: number,
  ): Promise<void> {
    const result = await manager
      .createQueryBuilder()
      .update(Event)
      .set({ availableCapacity: () => 'available_capacity - :quantity' })
      .where('id = :eventId', { eventId })
      .andWhere('available_capacity >= :quantity')
      .setParameters({ eventId, quantity })
      .execute()

    if (result.affected === 0) {
      throw new AppError(StatusErrors.CONFLICT, ResponseErrors.SOLD_OUT)
    }
  }

  /**
   * Devolve ingressos ao pool, marca os itens como liberados e recompõe o
   * contador — tudo na mesma transação.
   *
   * As três coisas andam juntas por necessidade: o índice parcial
   * `UNIQUE (ticket_id) WHERE released_at IS NULL` é o que permite revender o
   * assento. Devolver o ingresso sem marcar o item deixaria o próximo comprador
   * batendo na restrição.
   */
  private async releaseTickets(
    manager: EntityManager,
    orderId: string,
    eventId: string,
    ticketIds: string[],
  ): Promise<void> {
    if (ticketIds.length === 0) return

    const released = await manager.update(
      Ticket,
      { id: In(ticketIds), status: In([TicketStatus.RESERVED, TicketStatus.SOLD]) },
      { status: TicketStatus.AVAILABLE, ownerId: null },
    )

    await manager.update(
      OrderItem,
      { orderId, ticketId: In(ticketIds) },
      { releasedAt: new Date() },
    )

    const count = released.affected ?? 0

    if (count > 0) {
      await manager
        .createQueryBuilder()
        .update(Event)
        .set({ availableCapacity: () => 'LEAST(available_capacity + :count, total_capacity)' })
        .where('id = :eventId')
        .setParameters({ eventId, count })
        .execute()
    }
  }

  /** Preço da seção do assento; em pista, o preço da seção única. */
  private priceFor(event: Event, section: string | null): number {
    const sections = event.seatMapConfig?.sections ?? []
    const match = section ? sections.find((item) => item.name === section) : sections[0]

    return match?.price ?? sections[0]?.price ?? 0
  }
}
