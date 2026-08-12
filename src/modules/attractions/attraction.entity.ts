import { Column, Entity, Index, ManyToMany } from 'typeorm'
import { BaseEntity } from '../../shared/database/base.entity'
import { Event } from '../events/event.entity'

/** MER §3.4 — `attractions`. Artistas, bandas, shows e filmes do catálogo. */
@Entity('attractions')
export class Attraction extends BaseEntity {
  @Index('idx_attractions_tm_id', { unique: true })
  @Column({
    name: 'tm_attraction_id',
    type: 'varchar',
    length: 64,
    nullable: true,
    unique: true,
  })
  tmAttractionId!: string | null

  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ type: 'varchar', length: 512, nullable: true })
  url!: string | null

  @Column({ name: 'image_url', type: 'varchar', length: 512, nullable: true })
  imageUrl!: string | null

  @Column({ type: 'varchar', length: 128, nullable: true })
  segment!: string | null

  @Column({ type: 'varchar', length: 128, nullable: true })
  genre!: string | null

  @ManyToMany(() => Event, (event) => event.attractions)
  events!: Event[]
}
