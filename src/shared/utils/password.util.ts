import bcrypt from 'bcryptjs'
import { BCRYPT_ROUNDS } from '../constants'

/**
 * Hash e verificação de senha com bcrypt.
 *
 * 12 rounds conforme MER §3.1 — caro o bastante para tornar força bruta
 * impraticável e barato o bastante para o login não travar. O custo fica
 * embutido no próprio hash, então aumentar os rounds no futuro não invalida
 * as senhas já cadastradas.
 */

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS)
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}
