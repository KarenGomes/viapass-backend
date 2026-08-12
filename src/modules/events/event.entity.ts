import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm'
import { AuditedEntity } from '../../shared/database/base.entity'
import { EventStatus, SeatType } from '../../shared/types/enums'
import { Attraction } from '../attractions/attraction.entity'
import { Classification } from '../classifications/classification.entity'
import { EventImage } from './event-image.entity'
import { PriceRange } from './price-range.entity'
import { Order } from '../orders/order.entity'
import { Ticket } from '../tickets/ticket.entity'
import { User } from '../users/user.entity'
import { Venue } from '../venues/venue.entity'

/** Layout de assentos (MER §3.2, coluna `seat_map_config` JSONB). */
export interface SeatMapConfig {
  sections: Array<{
    name: string
    rows: Array<{ label: string; seats: number }>
    /** Preço da seção. O preço do TM é só referência; quem define é o organizador. */
    price: number
  }>
}

/** MER §3.2 — `events` */
@Entity('events')
@Index('idx_events_status', ['status'])
@Index('idx_events_organizer', ['organizerId'])
@Index('idx_events_date', ['eventDate'])
@Check('chk_events_total_capacity', '"total_capacity" > 0')
@Check('chk_events_available_capacity', '"available_capacity" >= 0')
@Check('chk_events_capacity_bounds', '"available_capacity" <= "total_capacity"')
export class Event extends AuditedEntity {
  /** Preenchido só quando o evento veio da Ticketmaster. */
  @Index('idx_events_tm_id', { unique: true })
  @Column({ name: 'tm_event_id', type: 'varchar', length: 64, nullable: true, unique: true })
  tmEventId!: string | null

  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @ManyToOne(() => Venue, (venue) => venue.events, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'venue_id' })
  venue!: Venue

  @Column({ name: 'venue_id', type: 'uuid' })
  venueId!: string

  @ManyToOne(() => User, (user) => user.organizedEvents, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'organizer_id' })
  organizer!: User

  @Column({ name: 'organizer_id', type: 'uuid' })
  organizerId!: string

  @ManyToOne(() => Classification, (classification) => classification.events, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'classification_id' })
  classification!: Classification | null

  @Column({ name: 'classification_id', type: 'uuid', nullable: true })
  classificationId!: string | null

  /** Data local do evento — é por ela que o cliente busca. */
  @Column({ name: 'event_date', type: 'date' })
  eventDate!: string

  /** Hora local. Nulo significa "a definir" (a Ticketmaster devolve assim). */
  @Column({ name: 'event_time', type: 'time', nullable: true })
  eventTime!: string | null

  /** Instante absoluto em UTC. Usado para ordenar e comparar entre timezones. */
  @Column({ name: 'event_datetime', type: 'timestamptz', nullable: true })
  eventDatetime!: Date | null

  @Column({
    type: 'enum',
    enum: Object.values(EventStatus),
    enumName: 'event_status_enum',
    default: EventStatus.DRAFT,
  })
  status!: EventStatus

  @Column({ name: 'total_capacity', type: 'int' })
  totalCapacity!: number

  /**
   * Cache do número de ingressos com status `available`.
   *
   * A fonte de verdade é a tabela `tickets` — este contador existe para a
   * listagem não precisar de um COUNT por evento. Só é alterado dentro da
   * mesma transação que muda o status dos tickets, com UPDATE condicional
   * (`WHERE available_capacity >= :qty`), que é o que impede a sobrevenda.
   */
  @Column({ name: 'available_capacity', type: 'int' })
  availableCapacity!: number

  @Column({
    name: 'seat_type',
    type: 'enum',
    enum: Object.values(SeatType),
    enumName: 'seat_type_enum',
  })
  seatType!: SeatType

  @Column({ name: 'seat_map_config', type: 'jsonb', nullable: true })
  seatMapConfig!: SeatMapConfig | null

  /** Imagem estática do mapa vinda do TM (`seatmap.staticUrl`) — não é interativa. */
  @Column({ name: 'seatmap_url', type: 'varchar', length: 512, nullable: true })
  seatmapUrl!: string | null

  @Column({ name: 'sale_start', type: 'timestamptz', nullable: true })
  saleStart!: Date | null

  @Column({ name: 'sale_end', type: 'timestamptz', nullable: true })
  saleEnd!: Date | null

  @ManyToMany(() => Attraction, (attraction) => attraction.events)
  @JoinTable({
    name: 'event_attractions',
    joinColumn: { name: 'event_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'attraction_id', referencedColumnName: 'id' },
  })
  attractions!: Attraction[]

  @OneToMany(() => EventImage, (image) => image.event)
  images!: EventImage[]

  @OneToMany(() => PriceRange, (priceRange) => priceRange.event)
  priceRanges!: PriceRange[]

  @OneToMany(() => Ticket, (ticket) => ticket.event)
  tickets!: Ticket[]

  @OneToMany(() => Order, (order) => order.event)
  orders!: Order[]
}
