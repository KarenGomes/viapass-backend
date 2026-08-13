import { randomBytes, randomUUID } from 'node:crypto'

/**
 * Token do link de compartilhamento: 32 bytes aleatórios em hex.
 *
 * Aleatório, e não derivado do ingresso, de propósito: um token derivado
 * permitiria calcular o link de outro ingresso a partir do próprio. Com 256
 * bits de entropia, adivinhar é inviável, e o link ainda expira em 48h e só
 * pode ser resgatado uma vez.
 */
export function generateShareToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * UUID gerado na aplicação, não pelo banco.
 *
 * O ingresso precisa do id **antes** do INSERT para calcular a assinatura
 * HMAC, que depende dele. Sem isso seriam duas idas ao banco por ingresso:
 * inserir, ler o id, calcular, atualizar.
 */
export function generateId(): string {
  return randomUUID()
}

export function expiresInHours(hours: number, from: Date = new Date()): Date {
  return new Date(from.getTime() + hours * 60 * 60 * 1000)
}
