import type { CorsOptions } from 'cors'
import { env } from './env'

/**
 * CORS restrito a uma lista explícita de origens.
 *
 * `credentials: true` é necessário porque o refresh token viaja em cookie
 * HttpOnly — e o navegador recusa cookie cross-origin sem isso. Como
 * `credentials` e `origin: '*'` são incompatíveis por especificação, a lista
 * de origens precisa mesmo ser explícita.
 */
const allowedOrigins = env.CORS_ORIGINS.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Sem header Origin: chamada de servidor, curl ou Swagger UI local.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error(`Origem não permitida pelo CORS: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86_400,
}

export { allowedOrigins }
