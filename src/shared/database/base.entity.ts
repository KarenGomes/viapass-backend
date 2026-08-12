import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

/**
 * Base das entidades: UUID como chave primária e `created_at`.
 *
 * Existe para não repetir as mesmas duas colunas em doze arquivos. Quem
 * precisar de `updated_at` estende `AuditedEntity`.
 *
 * Nota de desvio do MER: `classifications`, `event_images` e `price_ranges`
 * não listavam `created_at`. Foi incluído para uniformizar — custo zero e
 * evita a pergunta "quando essa linha entrou?" ficar sem resposta.
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date
}

/** Para entidades que mudam depois de criadas: users, events, orders. */
export abstract class AuditedEntity extends BaseEntity {
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
