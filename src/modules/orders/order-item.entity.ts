import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm'
import { BaseEntity } from '../../shared/database/base.entity'
import { Ticket } from '../tickets/ticket.entity'
import { Order } from './order.entity'

/**
 * MER §3.10 — `order_items`. Um item corresponde a exatamente um ingresso.
 *
 * A restrição é `UNIQUE (ticket_id) WHERE released_at IS NULL`: dois pedidos
 * **ativos** nunca apontam para o mesmo ingresso. É a última barreira contra
 * sobrevenda — mesmo que a lógica de reserva falhe, o banco recusa.
 *
 * O `WHERE` é o que permite revender um assento devolvido ao pool depois de um
 * pagamento recusado ou de um cancelamento. Com a restrição absoluta do MER
 * original, esse caminho quebrava — ver a migration
 * `ReleasableOrderItems1754100000000`.
 */
@Entity('order_items')
@Index('idx_order_items_order', ['orderId'])
export class OrderItem extends BaseEntity {
  @ManyToOne(() => Order, (order) => order.items, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order

  @Column({ name: 'order_id', type: 'uuid' })
  orderId!: string

  @OneToOne(() => Ticket, (ticket) => ticket.orderItem, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: Ticket

  @Column({ name: 'ticket_id', type: 'uuid' })
  ticketId!: string

  /**
   * Momento em que o ingresso voltou ao pool (recusa de pagamento ou
   * cancelamento). Enquanto for nulo, o item está vivo e segura o assento.
   *
   * Preenchido **na mesma transação** que muda o status do ticket — separar os
   * dois deixaria o índice parcial e o pool discordando.
   */
  @Column({ name: 'released_at', type: 'timestamptz', nullable: true })
  releasedAt!: Date | null

  /** Preço efetivamente pago, congelado no momento da compra. */
  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: string

  @Column({ name: 'seat_label', type: 'varchar', length: 64, nullable: true })
  seatLabel!: string | null
}
