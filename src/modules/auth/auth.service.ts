import type { Repository } from 'typeorm'
import { AppError } from '../../shared/errors/app-error'
import { ResponseErrors } from '../../shared/errors/response-errors'
import { StatusErrors } from '../../shared/errors/status-errors'
import { hashPassword, verifyPassword } from '../../shared/utils/password.util'
import {
  signTokenPair,
  verifyRefreshToken,
  type TokenPair,
} from '../../shared/utils/jwt.util'
import { UserRole } from '../../shared/types/enums'
import type { User } from '../users/user.entity'
import type { LoginDTO, RegisterDTO } from './auth.dto'

export interface PublicUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface AuthResult extends TokenPair {
  user: PublicUser
}

/** Remove o hash e campos internos antes de qualquer resposta. */
export function toPublicUser(user: User): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

export class AuthService {
  constructor(private readonly users: Repository<User>) {}

  async register(dto: RegisterDTO): Promise<AuthResult> {
    const existing = await this.users.findOne({ where: { email: dto.email } })

    if (existing) {
      throw new AppError(StatusErrors.CONFLICT, ResponseErrors.EMAIL_ALREADY_EXISTS)
    }

    // Usamos o retorno de `save`, e não a entidade passada: o TypeORM muta o
    // objeto no lugar para preencher o id gerado, mas depender dessa mutação
    // é confiar num detalhe de implementação que o retorno já entrega.
    const user = await this.users.save(
      this.users.create({
        name: dto.name,
        email: dto.email,
        passwordHash: await hashPassword(dto.password),
        role: dto.role ?? UserRole.CLIENT,
        isActive: true,
      }),
    )

    return this.issue(user)
  }

  async login(dto: LoginDTO): Promise<AuthResult> {
    // `password_hash` tem `select: false` na entidade; precisa ser pedido.
    const user = await this.users.findOne({
      where: { email: dto.email },
      select: { id: true, name: true, email: true, role: true, isActive: true, passwordHash: true },
    })

    /**
     * Usuário inexistente e senha errada devolvem a MESMA resposta. Diferenciar
     * transformaria o login num oráculo de quais e-mails existem na base.
     *
     * O hash falso mantém o tempo de resposta parecido nos dois casos — sem
     * ele, "e-mail não existe" responderia na hora e "senha errada" levaria os
     * ~200ms do bcrypt, e essa diferença já é a resposta.
     */
    const passwordMatches = user
      ? await verifyPassword(dto.password, user.passwordHash)
      : await verifyPassword(dto.password, FAKE_HASH)

    if (!user || !passwordMatches) {
      throw new AppError(StatusErrors.UNAUTHORIZED, ResponseErrors.INVALID_CREDENTIALS)
    }

    if (!user.isActive) {
      throw new AppError(StatusErrors.FORBIDDEN, ResponseErrors.USER_INACTIVE)
    }

    return this.issue(user)
  }

  /**
   * Renova o par de tokens. Diferente do login, aqui o banco é consultado: o
   * refresh dura 7 dias, tempo suficiente para o usuário ser desativado ou ter
   * o papel alterado, e o token novo precisa refletir isso.
   */
  async refresh(refreshToken: string): Promise<AuthResult> {
    const payload = verifyRefreshToken(refreshToken)
    const user = await this.users.findOne({ where: { id: payload.sub } })

    if (!user) {
      throw new AppError(StatusErrors.UNAUTHORIZED, ResponseErrors.TOKEN_INVALID)
    }

    if (!user.isActive) {
      throw new AppError(StatusErrors.FORBIDDEN, ResponseErrors.USER_INACTIVE)
    }

    return this.issue(user)
  }

  private issue(user: User): AuthResult {
    const tokens = signTokenPair({ sub: user.id, role: user.role, email: user.email })

    return { ...tokens, user: toPublicUser(user) }
  }
}

/**
 * Hash bcrypt de uma senha que ninguém usa, com o mesmo custo dos hashes
 * reais. Existe só para gastar o mesmo tempo quando o e-mail não existe.
 */
const FAKE_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEe.aQxL5sK5o5vT0uXqVQZ4gLZ8xJ5r0Hy'
