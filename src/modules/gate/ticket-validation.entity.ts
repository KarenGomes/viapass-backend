import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { PrimaryGeneratedColumn } from 'typeorm'
import { ValidationResult } from '../../shared/types/enums'
import { Ticket } from '../tickets/ticket.entity'
import { User } from '../users/user.entity'

/**
 * MER §3.12 — `ticket_validations`. Log de auditoria da portaria.
 *
 * **Toda** tentativa é registrada, inclusive as recusadas. É esse histórico
 * que permite responder depois "quem tentou entrar com um ingresso já usado,
 * quando e em qual portaria" — a linha de sucesso sozinha não contaria isso.
 *
 * Não estende `BaseEntity` porque a coluna de tempo aqui se chama
 * `validated_at`, e não `created_at`.
 */
@Entity('ticket_validations')
@Index('idx_ticket_validations_ticket', ['ticketId'])
export class TicketValidation {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Ticket, (ticket) => ticket.validations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: Ticket

  @Column({ name: 'ticket_id', type: 'uuid' })
  ticketId!: string

  /** Usuário de portaria que fez a leitura. */
  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'validated_by' })
  validatedBy!: User

  @Column({ name: 'validated_by', type: 'uuid' })
  validatedById!: string

  @Column({
    type: 'enum',
    enum: Object.values(ValidationResult),
    enumName: 'validation_result_enum',
  })
  result!: ValidationResult

  @CreateDateColumn({ name: 'validated_at', type: 'timestamptz' })
  validatedAt!: Date
}
