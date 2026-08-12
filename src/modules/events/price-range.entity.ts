import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../../shared/database/base.entity'
import { Event } from './event.entity'

/**
 * MER §3.8 — `price_ranges`.
 *
 * Faixa de preço **agregada** vinda da Ticketmaster. É referência histórica do
 * que o TM anunciava, não o preço de venda: quem define o preço final é o
 * organizador, em `events.seat_map_config`. Guardamos os dois para que a
 * origem do número continue rastreável.
 */
@Entity('price_ranges')
@Index('idx_price_ranges_event', ['eventId'])
export class PriceRange extends BaseEntity {
  @ManyToOne(() => Event, (event) => event.priceRanges, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: Event

  @Column({ name: 'event_id', type: 'uuid' })
  eventId!: string

  /** "standard", "vip". */
  @Column({ type: 'varchar', length: 64, nullable: true })
  type!: string | null

  /** ISO 4217. */
  @Column({ type: 'varchar', length: 8, default: 'BRL' })
  currency!: string

  @Column({ name: 'min_price', type: 'decimal', precision: 10, scale: 2 })
  minPrice!: string

  @Column({ name: 'max_price', type: 'decimal', precision: 10, scale: 2 })
  maxPrice!: string
}
