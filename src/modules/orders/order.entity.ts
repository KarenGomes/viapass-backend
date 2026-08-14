import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { AuditedEntity } from '../../shared/database/base.entity'
import { OrderStatus, PaymentMethod } from '../../shared/types/enums'
import { Event } from '../events/event.entity'
import { User } from '../users/user.entity'
import { OrderItem } from './order-item.entity'

/** MER §3.9 — `orders`. Um pedido pertence a um cliente e a um único evento. */
@Entity('orders')
@Index('idx_orders_user', ['userId'])
@Index('idx_orders_event', ['eventId'])
@Index('idx_orders_status', ['status'])
export class Order extends AuditedEntity {
  @ManyToOne(() => User, (user) => user.orders, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string

  @ManyToOne(() => Event, (event) => event.orders, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'event_id' })
  event!: Event

  @Column({ name: 'event_id', type: 'uuid' })
  eventId!: string

  @Column({
    type: 'enum',
    enum: Object.values(OrderStatus),
    enumName: 'order_status_enum',
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus

  /**
   * `decimal` vira string no driver do Postgres, de propósito: converter para
   * `number` introduz erro de ponto flutuante em valor monetário. A conversão
   * para exibição é responsabilidade da camada de apresentação.
   */
  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: string

  /** Soma dos ingressos, antes de qualquer taxa. */
  @Column({ name: 'subtotal_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotalAmount!: string

  /**
   * Taxa de serviço da plataforma.
   *
   * Guardada em coluna própria, e não recalculada na leitura: a alíquota pode
   * mudar, e um pedido de seis meses atrás precisa continuar mostrando o que
   * foi cobrado naquele dia.
   */
  @Column({ name: 'service_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  serviceFee!: string

  /** Proteção opcional contra imprevistos, cobrada por ingresso. */
  @Column({ name: 'protection_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  protectionFee!: string

  @Column({ name: 'has_protection', type: 'boolean', default: false })
  hasProtection!: boolean

  @Column({ type: 'varchar', length: 8, default: 'BRL' })
  currency!: string

  @Column({ name: 'payment_method', type: 'varchar', length: 64, nullable: true })
  paymentMethod!: PaymentMethod | null

  /** ID da transação simulada. Guardado para rastrear a tentativa. */
  @Column({ name: 'payment_id', type: 'varchar', length: 255, nullable: true })
  paymentId!: string | null

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt!: Date | null

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: ['insert'] })
  items!: OrderItem[]
}
