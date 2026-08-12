/**
 * Enums do domínio, espelhando os tipos ENUM do PostgreSQL definidos no MER.
 *
 * São `const enum`-like via objeto congelado + union type: o valor existe em
 * runtime (TypeORM precisa dele para mapear a coluna) e o tipo é estreito o
 * bastante para o compilador pegar um status inválido.
 */

// ── users.role (MER §3.1) ──
export const UserRole = {
  ORGANIZER: 'organizer',
  CLIENT: 'client',
  GATE: 'gate',
} as const
export type UserRole = (typeof UserRole)[keyof typeof UserRole]

// ── events.status (MER §3.2) ──
export const EventStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ONSALE: 'onsale',
  OFFSALE: 'offsale',
  CANCELED: 'canceled',
  COMPLETED: 'completed',
} as const
export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus]

// ── events.seat_type (MER §3.2) ──
export const SeatType = {
  /** Mapa de assentos: cada ingresso tem seção, fileira e número. */
  MAPPED: 'mapped',
  /** Pista: ingresso sem lugar marcado, controle apenas por quantidade. */
  GENERAL_ADMISSION: 'general_admission',
} as const
export type SeatType = (typeof SeatType)[keyof typeof SeatType]

// ── orders.status (MER §3.9) ──
export const OrderStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELED: 'canceled',
} as const
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

// ── tickets.status (MER §3.11) ──
export const TicketStatus = {
  /** No pool do evento, ainda não reservado por ninguém. */
  AVAILABLE: 'available',
  /** Preso a um pedido pendente de pagamento. */
  RESERVED: 'reserved',
  /** Pago. É o único estado que a portaria aceita validar. */
  SOLD: 'sold',
  /** Já validado na entrada. Não pode ser validado de novo. */
  USED: 'used',
  CANCELED: 'canceled',
} as const
export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus]

// ── ticket_validations.result (MER §3.12) ──
export const ValidationResult = {
  VALID: 'valid',
  INVALID: 'invalid',
  ALREADY_USED: 'already_used',
  WRONG_EVENT: 'wrong_event',
} as const
export type ValidationResult = (typeof ValidationResult)[keyof typeof ValidationResult]

// ── orders.payment_method (MER §3.9) ──
export const PaymentMethod = {
  CREDIT_CARD: 'credit_card',
  PIX: 'pix',
  BOLETO: 'boleto',
} as const
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]
