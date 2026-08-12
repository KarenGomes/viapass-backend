import { Column, Entity, OneToMany } from 'typeorm'
import { BaseEntity } from '../../shared/database/base.entity'
import { Event } from '../events/event.entity'

/**
 * MER §3.6 — `classifications`.
 *
 * Desnormalizada de propósito: a hierarquia Segment → Genre → SubGenre da
 * Ticketmaster cabe numa linha só. Normalizar em três tabelas obrigaria dois
 * JOINs extras em toda listagem filtrada, sem ganho — a hierarquia é fixa e
 * nunca é consultada isoladamente.
 */
@Entity('classifications')
export class Classification extends BaseEntity {
  @Column({ name: 'tm_segment_id', type: 'varchar', length: 64, nullable: true })
  tmSegmentId!: string | null

  /** Ex.: "Music", "Sports", "Film". */
  @Column({ name: 'segment_name', type: 'varchar', length: 128 })
  segmentName!: string

  @Column({ name: 'tm_genre_id', type: 'varchar', length: 64, nullable: true })
  tmGenreId!: string | null

  /** Ex.: "Rock", "Comedy". */
  @Column({ name: 'genre_name', type: 'varchar', length: 128, nullable: true })
  genreName!: string | null

  @Column({ name: 'tm_subgenre_id', type: 'varchar', length: 64, nullable: true })
  tmSubgenreId!: string | null

  /** Ex.: "Alternative Rock". */
  @Column({ name: 'subgenre_name', type: 'varchar', length: 128, nullable: true })
  subgenreName!: string | null

  @OneToMany(() => Event, (event) => event.classification)
  events!: Event[]
}
