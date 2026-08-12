import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm'
import { BaseEntity } from '../../shared/database/base.entity'
import { Ticket } from '../tickets/ticket.entity'
import { Order } from './order.entity'

/**
 * MER §3.10 — `order_items`. Um item corresponde a exatamente um ingresso.
 *
 * `ticket_id` é UNIQUE: um ingresso nunca aparece em dois pedidos. Isso é
 * proposital e é a última barreira contra sobrevenda — mesmo que a lógica de
 * reserva falhe, o banco recusa.
 *
 * Efeito colateral conhecido: um ingresso cancelado e recolocado à venda não
 * poderá gerar um segundo item. Ver docs/NEXT-STEPS.md.
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

  @Column({ name: 'ticket_id', type: 'uuid', unique: true })
  ticketId!: string

  /** Preço efetivamente pago, congelado no momento da compra. */
  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: string

  @Column({ name: 'seat_label', type: 'varchar', length: 64, nullable: true })
  seatLabel!: string | null
}
