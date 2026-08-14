import type { Repository } from 'typeorm'
import type { AppError } from '../../shared/errors/app-error'
import { UserRole } from '../../shared/types/enums'
import { hashPassword } from '../../shared/utils/password.util'
import { verifyAccessToken, verifyRefreshToken } from '../../shared/utils/jwt.util'
import type { User } from '../users/user.entity'
import { AuthService } from './auth.service'

/**
 * Dublê mínimo do repositório — só os métodos que o `AuthService` usa.
 *
 * Tipado como `Record<string, jest.Mock>` de propósito: reproduzir as
 * sobrecargas de `Repository.save` do TypeORM só para satisfazer o
 * compilador dobraria o tamanho do arquivo sem tornar o teste mais correto.
 * A conversão fica isolada aqui, num lugar só.
 */
type RepositoryStub = Record<string, jest.Mock>

function usersRepository(overrides: RepositoryStub = {}): Repository<User> {
  return {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn((data: unknown) => data),
    save: jest.fn(async (user: Record<string, unknown>) => ({ ...user, id: 'user-1' })),
    ...overrides,
  } as unknown as Repository<User>
}

async function existingUser(password = 'senha-bem-longa'): Promise<User> {
  return {
    id: 'user-1',
    name: 'Ana Ribeiro',
    email: 'ana@exemplo.com',
    passwordHash: await hashPassword(password),
    role: UserRole.CLIENT,
    isActive: true,
  } as User
}

describe('AuthService.register', () => {
  it('cria a conta e devolve o par de tokens', async () => {
    const service = new AuthService(usersRepository())

    const result = await service.register({
      name: 'Ana Ribeiro',
      email: 'ana@exemplo.com',
      password: 'senha-bem-longa',
    })

    expect(result.user).toEqual({
      id: 'user-1',
      name: 'Ana Ribeiro',
      email: 'ana@exemplo.com',
      role: UserRole.CLIENT,
    })
    expect(verifyAccessToken(result.accessToken).sub).toBe('user-1')
    expect(verifyRefreshToken(result.refreshToken).sub).toBe('user-1')
  })

  it('nunca devolve o hash da senha', async () => {
    const service = new AuthService(usersRepository())

    const result = await service.register({
      name: 'Ana',
      email: 'ana@exemplo.com',
      password: 'senha-bem-longa',
    })

    expect(JSON.stringify(result.user)).not.toContain('$2')
    expect(result.user).not.toHaveProperty('passwordHash')
  })

  it('grava a senha como hash, nunca em texto puro', async () => {
    const save = jest.fn(async (user: User) => ({ ...user, id: 'user-1' }))
    const service = new AuthService(usersRepository({ save }))

    await service.register({ name: 'Ana', email: 'a@b.com', password: 'senha-bem-longa' })

    const saved = save.mock.calls[0]?.[0] as User
    expect(saved.passwordHash).not.toBe('senha-bem-longa')
    expect(saved.passwordHash).toMatch(/^\$2[aby]\$12\$/)
  })

  it('usa o papel client por padrão', async () => {
    const service = new AuthService(usersRepository())

    const result = await service.register({
      name: 'Ana',
      email: 'a@b.com',
      password: 'senha-bem-longa',
    })

    expect(result.user.role).toBe(UserRole.CLIENT)
  })

  it('recusa e-mail já cadastrado com 409', async () => {
    const service = new AuthService(
      usersRepository({ findOne: jest.fn().mockResolvedValue(await existingUser()) }),
    )

    await expect(
      service.register({ name: 'Ana', email: 'ana@exemplo.com', password: 'senha-bem-longa' }),
    ).rejects.toMatchObject({ statusCode: 409, body: { msg: 'Este email já está cadastrado' } })
  })
})

describe('AuthService.login', () => {
  it('autentica com a senha correta', async () => {
    const user = await existingUser()
    const service = new AuthService(
      usersRepository({ findOne: jest.fn().mockResolvedValue(user) }),
    )

    const result = await service.login({ email: 'ana@exemplo.com', password: 'senha-bem-longa' })

    expect(result.user.id).toBe('user-1')
    expect(verifyAccessToken(result.accessToken).role).toBe(UserRole.CLIENT)
  })

  it('recusa senha errada', async () => {
    const user = await existingUser()
    const service = new AuthService(
      usersRepository({ findOne: jest.fn().mockResolvedValue(user) }),
    )

    await expect(
      service.login({ email: 'ana@exemplo.com', password: 'senha-errada' }),
    ).rejects.toMatchObject({ statusCode: 401 })
  })

  it('devolve a MESMA mensagem para e-mail inexistente e senha errada', async () => {
    // Diferenciar transformaria o login num oráculo de e-mails cadastrados.
    const user = await existingUser()

    const wrongPassword = new AuthService(
      usersRepository({ findOne: jest.fn().mockResolvedValue(user) }),
    )
    const noUser = new AuthService(usersRepository())

    const first = await wrongPassword
      .login({ email: 'ana@exemplo.com', password: 'errada' })
      .catch((error: AppError) => error)
    const second = await noUser
      .login({ email: 'ninguem@exemplo.com', password: 'errada' })
      .catch((error: AppError) => error)

    expect((first as AppError).body).toEqual((second as AppError).body)
    expect((first as AppError).statusCode).toBe((second as AppError).statusCode)
  })

  it('recusa conta desativada com 403', async () => {
    const user = { ...(await existingUser()), isActive: false } as User
    const service = new AuthService(
      usersRepository({ findOne: jest.fn().mockResolvedValue(user) }),
    )

    await expect(
      service.login({ email: 'ana@exemplo.com', password: 'senha-bem-longa' }),
    ).rejects.toMatchObject({ statusCode: 403, body: { msg: 'Esta conta está desativada' } })
  })

  it('pede explicitamente o passwordHash — a coluna tem select:false', async () => {
    const findOne = jest.fn().mockResolvedValue(await existingUser())
    const service = new AuthService(usersRepository({ findOne }))

    await service.login({ email: 'ana@exemplo.com', password: 'senha-bem-longa' })

    expect(findOne).toHaveBeenCalledWith(
      expect.objectContaining({ select: expect.objectContaining({ passwordHash: true }) }),
    )
  })
})

describe('AuthService.refresh', () => {
  it('emite tokens novos a partir de um refresh válido', async () => {
    const user = await existingUser()
    const service = new AuthService(
      usersRepository({ findOne: jest.fn().mockResolvedValue(user) }),
    )

    const login = await service.login({ email: 'ana@exemplo.com', password: 'senha-bem-longa' })
    const refreshed = await service.refresh(login.refreshToken)

    expect(refreshed.user.id).toBe('user-1')
    expect(verifyAccessToken(refreshed.accessToken).sub).toBe('user-1')
  })

  it('recusa um access token usado como refresh — segredos são distintos', async () => {
    const user = await existingUser()
    const service = new AuthService(
      usersRepository({ findOne: jest.fn().mockResolvedValue(user) }),
    )

    const login = await service.login({ email: 'ana@exemplo.com', password: 'senha-bem-longa' })

    await expect(service.refresh(login.accessToken)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('recusa token corrompido', async () => {
    const service = new AuthService(usersRepository())

    await expect(service.refresh('nao.e.um.token')).rejects.toMatchObject({ statusCode: 401 })
  })

  it('consulta o banco — o papel pode ter mudado em 7 dias', async () => {
    const user = await existingUser()
    const findOne = jest.fn().mockResolvedValue(user)
    const service = new AuthService(usersRepository({ findOne }))

    const login = await service.login({ email: 'ana@exemplo.com', password: 'senha-bem-longa' })
    findOne.mockClear()

    await service.refresh(login.refreshToken)

    expect(findOne).toHaveBeenCalledTimes(1)
  })

  it('recusa refresh de conta desativada depois do login', async () => {
    const user = await existingUser()
    const findOne = jest.fn().mockResolvedValue(user)
    const service = new AuthService(usersRepository({ findOne }))

    const login = await service.login({ email: 'ana@exemplo.com', password: 'senha-bem-longa' })
    findOne.mockResolvedValue({ ...user, isActive: false })

    await expect(service.refresh(login.refreshToken)).rejects.toMatchObject({ statusCode: 403 })
  })
})
