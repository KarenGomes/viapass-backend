import 'dotenv/config'

/**
 * Variáveis de ambiente validadas na inicialização.
 *
 * A aplicação falha ao subir se faltar uma variável obrigatória, em vez de
 * quebrar no primeiro request que precisar dela. Erro de configuração deve
 * aparecer no deploy, não em produção às 3h da manhã.
 */

type NodeEnv = 'development' | 'test' | 'production'

class EnvValidationError extends Error {
  constructor(problems: string[]) {
    super(
      `Configuração de ambiente inválida:\n${problems.map((p) => `  · ${p}`).join('\n')}\n` +
        'Confira o arquivo .env (use .env.example como referência).',
    )
    this.name = 'EnvValidationError'
  }
}

const problems: string[] = []

function required(key: string): string {
  const value = process.env[key]

  if (value === undefined || value.trim() === '') {
    problems.push(`${key} é obrigatória e não foi definida`)
    return ''
  }

  return value
}

function optional(key: string, fallback: string): string {
  const value = process.env[key]
  return value === undefined || value.trim() === '' ? fallback : value
}

function integer(key: string, fallback: number): number {
  const raw = process.env[key]

  if (raw === undefined || raw.trim() === '') return fallback

  const parsed = Number(raw)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    problems.push(`${key} deve ser um inteiro positivo (recebido: "${raw}")`)
    return fallback
  }

  return parsed
}

function secret(key: string, minLength = 32): string {
  const value = required(key)

  // Segredo curto passa despercebido e derruba a garantia do JWT e do QR Code.
  if (value !== '' && value.length < minLength) {
    problems.push(`${key} deve ter ao menos ${minLength} caracteres (tem ${value.length})`)
  }

  return value
}

function boolean(key: string, fallback: boolean): boolean {
  const raw = process.env[key]

  if (raw === undefined || raw.trim() === '') return fallback

  const normalized = raw.trim().toLowerCase()

  if (normalized === 'true' || normalized === '1') return true
  if (normalized === 'false' || normalized === '0') return false

  problems.push(`${key} deve ser true ou false (recebido: "${raw}")`)
  return fallback
}

function nodeEnv(): NodeEnv {
  const value = optional('NODE_ENV', 'development')

  if (value !== 'development' && value !== 'test' && value !== 'production') {
    problems.push(`NODE_ENV deve ser development, test ou production (recebido: "${value}")`)
    return 'development'
  }

  return value
}

const NODE_ENV = nodeEnv()

const hasDatabaseUrl = (process.env.DATABASE_URL ?? '').trim() !== ''

/** Com `DATABASE_URL` presente, os campos avulsos não são cobrados. */
function requiredUnlessUrl(key: string): string {
  if (hasDatabaseUrl) return process.env[key] ?? ''

  return required(key)
}

/**
 * Host do banco.
 *
 * Em produção não há padrão: `localhost` como fallback transforma "esqueci de
 * configurar" em "conectando em mim mesmo", e o erro só aparece como
 * `ECONNREFUSED 127.0.0.1:5432` depois da imagem construída e publicada.
 * Configuração faltando tem que falhar dizendo o que falta.
 */
function databaseHost(): string {
  if (hasDatabaseUrl) return ''

  const value = process.env.DB_HOST

  if (value === undefined || value.trim() === '') {
    if (NODE_ENV === 'production') {
      problems.push(
        'DB_HOST é obrigatória em produção (ou use DATABASE_URL). ' +
          'Sem ela a aplicação tentaria conectar em localhost, onde não há banco.',
      )
      return ''
    }

    return 'localhost'
  }

  return value
}

export const env = {
  NODE_ENV,
  isProduction: NODE_ENV === 'production',
  isTest: NODE_ENV === 'test',

  PORT: integer('PORT', 3001),

  /**
   * Connection string completa. Quando presente, vence os campos avulsos.
   *
   * É o formato que Render, Fly, Railway e Heroku entregam pronto — colar uma
   * variável em vez de transcrever cinco elimina o erro de digitação que só
   * aparece no deploy.
   */
  DATABASE_URL: optional('DATABASE_URL', ''),

  DB_HOST: databaseHost(),
  DB_PORT: integer('DB_PORT', 5432),
  DB_USERNAME: requiredUnlessUrl('DB_USERNAME'),
  DB_PASSWORD: requiredUnlessUrl('DB_PASSWORD'),
  DB_DATABASE: requiredUnlessUrl('DB_DATABASE'),

  /**
   * TLS na conexão com o banco.
   *
   * Postgres gerenciado exige TLS no endereço externo e dispensa no interno.
   * O certificado costuma ser assinado por CA própria do provedor, então a
   * verificação da cadeia fica desligada — ver `database.ts`.
   */
  DB_SSL: boolean('DB_SSL', false),

  JWT_SECRET: secret('JWT_SECRET'),
  JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '15m'),
  JWT_REFRESH_SECRET: secret('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRES_IN: optional('JWT_REFRESH_EXPIRES_IN', '7d'),

  /** Assina o QR Code do ingresso (HMAC-SHA256). Ver MER §3.11. */
  TICKET_HMAC_SECRET: secret('TICKET_HMAC_SECRET'),

  TM_API_KEY: optional('TM_API_KEY', ''),
  TM_API_BASE_URL: optional('TM_API_BASE_URL', 'https://app.ticketmaster.com/discovery/v2'),

  /** Origem do front-end: usada no CORS e nos links de compartilhamento. */
  APP_BASE_URL: optional('APP_BASE_URL', 'http://localhost:5173'),
  CORS_ORIGINS: optional('CORS_ORIGINS', 'http://localhost:5173'),
} as const

if (problems.length > 0) {
  throw new EnvValidationError(problems)
}

export type Env = typeof env
