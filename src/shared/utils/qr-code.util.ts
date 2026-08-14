import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import QRCode from 'qrcode'
import { env } from '../../config/env'

/**
 * Código e assinatura do ingresso (MER §3.11).
 *
 * O QR carrega `code.assinatura`. A assinatura é
 * `HMAC_SHA256(id + ':' + code, TICKET_HMAC_SECRET)` — sem o segredo do
 * servidor não há como produzir um par válido, que é o requisito de "QR que
 * não pode ser forjado".
 *
 * Por que HMAC e não só um UUID aleatório: o UUID exigiria consultar o banco
 * para saber se é válido, e um código digitado errado seria indistinguível de
 * um forjado. Com HMAC, a portaria descarta a falsificação antes de qualquer
 * query — e o código continua curto o bastante para ser digitado à mão.
 */

/**
 * Alfabeto sem `0/O` e `1/I/L`: o código é lido em voz alta e digitado na
 * portaria, e esses pares são a origem clássica do erro de digitação.
 */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function randomBlock(length: number): string {
  const bytes = randomBytes(length)
  let result = ''

  for (let index = 0; index < length; index += 1) {
    result += ALPHABET[(bytes[index] as number) % ALPHABET.length]
  }

  return result
}

/** Ex.: `VP-A3S12-X7K9`. Prefixo fixo ajuda a reconhecer o código na portaria. */
export function generateTicketCode(): string {
  return `VP-${randomBlock(5)}-${randomBlock(4)}`
}

export function signTicket(ticketId: string, code: string, secret = env.TICKET_HMAC_SECRET): string {
  return createHmac('sha256', secret).update(`${ticketId}:${code}`).digest('hex')
}

/**
 * Compara assinaturas em tempo constante.
 *
 * `===` vaza informação pelo tempo de resposta: quanto mais prefixo correto,
 * mais tarde a comparação falha. Com tentativas suficientes dá para descobrir
 * a assinatura byte a byte.
 */
export function verifyTicketSignature(
  ticketId: string,
  code: string,
  signature: string,
  secret = env.TICKET_HMAC_SECRET,
): boolean {
  const expected = signTicket(ticketId, code, secret)

  if (expected.length !== signature.length) return false

  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

/** Conteúdo gravado no QR: código e assinatura, separados por ponto. */
export function buildQrPayload(code: string, qrHash: string): string {
  return `${code}.${qrHash}`
}

export interface ParsedQrPayload {
  code: string
  signature: string
}

/**
 * Interpreta o conteúdo lido pela câmera.
 *
 * Aceita também o código puro digitado à mão — nesse caso não há assinatura, e
 * a validação recai sobre a busca no banco. A digitação manual é exigência do
 * desafio como alternativa à câmera.
 */
export function parseQrPayload(raw: string): ParsedQrPayload | null {
  const value = raw.trim()

  if (value === '') return null

  const separator = value.lastIndexOf('.')

  if (separator === -1) return { code: value.toUpperCase(), signature: '' }

  const code = value.slice(0, separator).trim().toUpperCase()
  const signature = value.slice(separator + 1).trim()

  return code === '' ? null : { code, signature }
}

/** Gera o QR como data URI, pronto para `<img src>` no front. */
export function renderQrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 320,
  })
}
