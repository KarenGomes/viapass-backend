/** Versão da API, exposta no health check e no Swagger. */
export const APP_VERSION = '1.0.0'

/** Prefixo de todas as rotas da API. */
export const API_PREFIX = '/api'

/** Paginação padrão das listagens. */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_SIZE: 20,
  MAX_SIZE: 100,
} as const

/** Custo do bcrypt. 12 rounds conforme MER §3.1. */
export const BCRYPT_ROUNDS = 12

/**
 * Cobranças do checkout.
 *
 * Ficam aqui, e não espalhadas no service, porque são regra de negócio que
 * muda por decisão comercial — e quem for mexer precisa achar num lugar só.
 *
 * A taxa de serviço é percentual sobre os ingressos; a proteção é valor fixo
 * por ingresso, como o design descreve ("R$ 15,00 por ingresso").
 */
export const CHECKOUT_FEES = {
  /** 10% sobre o subtotal. */
  SERVICE_FEE_RATE: 0.1,
  /** Proteção contra imprevistos, por ingresso. */
  PROTECTION_FEE_PER_TICKET: 15,
} as const

/** Validade do link de compartilhamento de ingresso (MER §3.13). */
export const SHARE_LINK_TTL_HOURS = 48

/**
 * Limites da Ticketmaster Discovery API, confirmados na documentação oficial:
 * 5 requisições por segundo, 5.000 por dia, e paginação profunda limitada a
 * `size × page < 1000`. O MER citava só o limite por segundo.
 */
export const TICKETMASTER = {
  MAX_REQUESTS_PER_SECOND: 5,
  DAILY_QUOTA: 5_000,
  MAX_DEEP_PAGING_ITEMS: 1_000,
  DEFAULT_PAGE_SIZE: 20,
} as const
