import { Column, Entity, Index, OneToMany } from 'typeorm'
import { AuditedEntity } from '../../shared/database/base.entity'
import { UserRole } from '../../shared/types/enums'
import { Event } from '../events/event.entity'
import { Order } from '../orders/order.entity'

/** MER §3.1 — `users` */
@Entity('users')
@Index('idx_users_role', ['role'])
export class User extends AuditedEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Index('idx_users_email', { unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string

  /**
   * bcrypt, 12 rounds. `select: false` mantém o hash fora de toda query que
   * não o peça explicitamente — inclusive das respostas serializadas.
   */
  @Column({ name: 'password_hash', type: 'varchar', length: 255, select: false })
  passwordHash!: string

  @Column({
    type: 'enum',
    enum: Object.values(UserRole),
    enumName: 'user_role_enum',
    default: UserRole.CLIENT,
  })
  role!: UserRole

  /** Soft-delete: a única entidade que usa este padrão (MER §9). */
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean

  @OneToMany(() => Event, (event) => event.organizer)
  organizedEvents!: Event[]

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[]
}
