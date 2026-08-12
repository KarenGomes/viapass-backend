import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm'
import { BaseEntity } from '../../shared/database/base.entity'
import { TicketStatus } from '../../shared/types/enums'
import { Event } from '../events/event.entity'
import { OrderItem } from '../orders/order-item.entity'
import { User } from '../users/user.entity'
import { TicketShare } from './ticket-share.entity'
import { TicketValidation } from '../gate/ticket-validation.entity'

/**
 * MER §3.11 — `tickets`. Fonte de verdade da disponibilidade.
 *
 * Ciclo de vida: `available` → `reserved` → `sold` → `used`.
 * O pool inteiro é criado quando o organizador publica o evento; a reserva
 * **atualiza** o status de linhas existentes, nunca insere novas. (O MER §7.1
 * dizia INSERT, o que conflitava com §6.2 — ver docs/PROGRESSO.md.)
 */
@Entity('tickets')
@Index('idx_tickets_event', ['eventId'])
@Index('idx_tickets_owner', ['ownerId'])
@Index('idx_tickets_status', ['status'])
// Impede dois ingressos vivos para o mesmo lugar. O índice é parcial porque
// um assento cancelado deve poder ser recolocado à venda.
@Index('uq_tickets_seat', ['eventId', 'seatSection', 'seatRow', 'seatNumber'], {
  unique: true,
  where: `status <> 'canceled' AND seat_number IS NOT NULL`,
})
export class Ticket extends BaseEntity {
  @ManyToOne(() => Event, (event) => event.tickets, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: Event

  @Column({ name: 'event_id', type: 'uuid' })
  eventId!: string

  /** Nulo enquanto o ingresso está no pool. Muda no claim de compartilhamento. */
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner_id' })
  owner!: User | null

  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  ownerId!: string | null

  /** Código legível para digitação manual na portaria. Ex.: `VP-A3S12-X7K9`. */
  @Index('idx_tickets_code', { unique: true })
  @Column({ type: 'varchar', length: 32, unique: true })
  code!: string

  /**
   * `HMAC_SHA256(id + ':' + code, TICKET_HMAC_SECRET)` — é o conteúdo do QR.
   * Sem o segredo, não dá para forjar um par (código, hash) válido.
   */
  @Index('idx_tickets_qr_hash', { unique: true })
  @Column({ name: 'qr_hash', type: 'varchar', length: 255, unique: true })
  qrHash!: string

  @Column({
    type: 'enum',
    enum: Object.values(TicketStatus),
    enumName: 'ticket_status_enum',
    default: TicketStatus.AVAILABLE,
  })
  status!: TicketStatus

  /** Rótulo pronto para exibição. Ex.: "Plateia A · Fileira 3 · Assento 12". */
  @Column({ name: 'seat_label', type: 'varchar', length: 64, nullable: true })
  seatLabel!: string | null

  @Column({ name: 'seat_section', type: 'varchar', length: 32, nullable: true })
  seatSection!: string | null

  @Column({ name: 'seat_row', type: 'varchar', length: 16, nullable: true })
  seatRow!: string | null

  /** Nulo em evento de pista (`general_admission`). */
  @Column({ name: 'seat_number', type: 'int', nullable: true })
  seatNumber!: number | null

  @OneToOne(() => OrderItem, (orderItem) => orderItem.ticket)
  orderItem!: OrderItem | null

  @OneToMany(() => TicketValidation, (validation) => validation.ticket)
  validations!: TicketValidation[]

  @OneToMany(() => TicketShare, (share) => share.ticket)
  shares!: TicketShare[]
}
