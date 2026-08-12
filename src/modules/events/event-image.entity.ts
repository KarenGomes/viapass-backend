import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../../shared/database/base.entity'
import { Event } from './event.entity'

/**
 * MER §3.7 — `event_images`. Imagens promocionais vindas da Ticketmaster.
 *
 * Mora em `events/` (e não numa pasta `images/`) porque não tem ciclo de vida
 * próprio: nasce e morre com o evento, via ON DELETE CASCADE.
 */
@Entity('event_images')
@Index('idx_event_images_event', ['eventId'])
export class EventImage extends BaseEntity {
  @ManyToOne(() => Event, (event) => event.images, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: Event

  @Column({ name: 'event_id', type: 'uuid' })
  eventId!: string

  @Column({ type: 'varchar', length: 512 })
  url!: string

  /** "16_9", "3_2", "4_3", "1_1" — o front escolhe pelo espaço disponível. */
  @Column({ type: 'varchar', length: 16, nullable: true })
  ratio!: string | null

  @Column({ type: 'int', nullable: true })
  width!: number | null

  @Column({ type: 'int', nullable: true })
  height!: number | null

  /** Imagem genérica da categoria, não do evento. Última opção de exibição. */
  @Column({ name: 'is_fallback', type: 'boolean', default: false })
  isFallback!: boolean
}
