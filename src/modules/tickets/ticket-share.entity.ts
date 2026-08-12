import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../../shared/database/base.entity'
import { Ticket } from './ticket.entity'
import { User } from '../users/user.entity'

/**
 * MER §3.13 — `ticket_shares`. Link de compartilhamento de um ingresso.
 *
 * O token é aleatório de 32 bytes, não derivado do ingresso: descobrir um
 * token não ajuda a descobrir os outros. Expira em 48h e só pode ser
 * resgatado uma vez.
 */
@Entity('ticket_shares')
@Index('idx_ticket_shares_ticket', ['ticketId'])
export class TicketShare extends BaseEntity {
  @ManyToOne(() => Ticket, (ticket) => ticket.shares, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: Ticket

  @Column({ name: 'ticket_id', type: 'uuid' })
  ticketId!: string

  @Index('idx_ticket_shares_token', { unique: true })
  @Column({ name: 'share_token', type: 'varchar', length: 128, unique: true })
  shareToken!: string

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date

  @Column({ name: 'is_claimed', type: 'boolean', default: false })
  isClaimed!: boolean

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'claimed_by' })
  claimedBy!: User | null

  @Column({ name: 'claimed_by', type: 'uuid', nullable: true })
  claimedById!: string | null
}
