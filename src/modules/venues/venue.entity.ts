import { Column, Entity, Index, OneToMany } from 'typeorm'
import { BaseEntity } from '../../shared/database/base.entity'
import { Event } from '../events/event.entity'

/** MER §3.3 — `venues`. Importado da Ticketmaster ou criado pelo organizador. */
@Entity('venues')
export class Venue extends BaseEntity {
  /** Chave de deduplicação no upsert de importação. Nulo se criado à mão. */
  @Index('idx_venues_tm_id', { unique: true })
  @Column({ name: 'tm_venue_id', type: 'varchar', length: 64, nullable: true, unique: true })
  tmVenueId!: string | null

  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ name: 'address_line1', type: 'varchar', length: 255, nullable: true })
  addressLine1!: string | null

  @Column({ type: 'varchar', length: 128, nullable: true })
  city!: string | null

  @Column({ name: 'state_code', type: 'varchar', length: 16, nullable: true })
  stateCode!: string | null

  /** ISO 3166. */
  @Column({ name: 'country_code', type: 'varchar', length: 8, nullable: true })
  countryCode!: string | null

  @Column({ name: 'postal_code', type: 'varchar', length: 32, nullable: true })
  postalCode!: string | null

  /** Timezone IANA — necessário para converter `event_time` local em UTC. */
  @Column({ type: 'varchar', length: 64, nullable: true })
  timezone!: string | null

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude!: string | null

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude!: string | null

  @OneToMany(() => Event, (event) => event.venue)
  events!: Event[]
}
