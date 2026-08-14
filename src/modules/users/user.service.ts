import type { Repository } from 'typeorm'
import { AppError } from '../../shared/errors/app-error'
import { ResponseErrors } from '../../shared/errors/response-errors'
import { StatusErrors } from '../../shared/errors/status-errors'
import { toPublicUser, type PublicUser } from '../auth/auth.service'
import type { User } from './user.entity'
import type { UpdateUserDTO } from './user.dto'

export class UserService {
  constructor(private readonly users: Repository<User>) {}

  async findById(id: string): Promise<PublicUser> {
    const user = await this.users.findOne({ where: { id } })

    if (!user || !user.isActive) {
      throw new AppError(StatusErrors.NOT_FOUND, ResponseErrors.USER_NOT_FOUND)
    }

    return toPublicUser(user)
  }

  /**
   * Atualiza nome e e-mail do próprio usuário.
   *
   * Papel não é editável aqui de propósito: seria escalada de privilégio em
   * uma linha — um cliente virando organizador com um PUT no próprio perfil.
   */
  async updateProfile(id: string, dto: UpdateUserDTO): Promise<PublicUser> {
    const user = await this.users.findOne({ where: { id } })

    if (!user || !user.isActive) {
      throw new AppError(StatusErrors.NOT_FOUND, ResponseErrors.USER_NOT_FOUND)
    }

    if (dto.email && dto.email !== user.email) {
      const taken = await this.users.findOne({ where: { email: dto.email } })

      if (taken) {
        throw new AppError(StatusErrors.CONFLICT, ResponseErrors.EMAIL_ALREADY_EXISTS)
      }

      user.email = dto.email
    }

    if (dto.name) {
      user.name = dto.name
    }

    await this.users.save(user)

    return toPublicUser(user)
  }

  /**
   * Desativa a conta (soft-delete via `is_active`).
   *
   * Não apagamos a linha: pedidos e ingressos apontam para o usuário, e as FKs
   * são `ON DELETE RESTRICT` justamente para o histórico financeiro não sumir
   * quando alguém encerra a conta.
   */
  async deactivate(id: string): Promise<void> {
    const user = await this.users.findOne({ where: { id } })

    if (!user) {
      throw new AppError(StatusErrors.NOT_FOUND, ResponseErrors.USER_NOT_FOUND)
    }

    user.isActive = false
    await this.users.save(user)
  }
}
