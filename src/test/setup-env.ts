/**
 * Variáveis de ambiente da suíte de testes.
 *
 * Carregado por `setupFiles`, ou seja, antes de qualquer import do código sob
 * teste — o que importa porque `config/env.ts` valida na importação e
 * derrubaria a suíte inteira sem estes valores.
 *
 * Os segredos abaixo são fictícios e só precisam ter 32+ caracteres para
 * passar na validação.
 */
process.env.NODE_ENV = 'test'
process.env.DB_HOST = process.env.DB_HOST ?? 'localhost'
process.env.DB_PORT = process.env.DB_PORT ?? '5432'
process.env.DB_USERNAME = process.env.DB_USERNAME ?? 'viapass'
process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? 'viapass_dev'
process.env.DB_DATABASE = process.env.DB_DATABASE ?? 'viapass_test'
process.env.JWT_SECRET = 'segredo-de-teste-com-mais-de-32-caracteres-ok'
process.env.JWT_REFRESH_SECRET = 'outro-segredo-de-teste-com-mais-de-32-caracteres'
process.env.TICKET_HMAC_SECRET = 'segredo-hmac-de-teste-com-mais-de-32-caracteres'
process.env.CORS_ORIGINS = 'http://localhost:5173'
