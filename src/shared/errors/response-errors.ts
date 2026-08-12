/**
 * Mensagens de erro da aplicação, centralizadas por domínio.
 *
 * Regra: nenhuma mensagem de erro é escrita inline em controller ou service.
 * Todas nascem aqui. Isso garante texto consistente para o front-end, permite
 * traduzir tudo de um lugar só e evita a mesma falha ser descrita de três
 * jeitos diferentes em três endpoints.
 *
 * Toda resposta de erro tem a forma `{ msg: string }`.
 */
export type ErrorBody = { msg: string }

export class ResponseErrors {
  // ── Auth ──
  static readonly INVALID_CREDENTIALS: ErrorBody = { msg: 'Email ou senha inválidos' }
  static readonly TOKEN_EXPIRED: ErrorBody = { msg: 'Token expirado, faça login novamente' }
  static readonly TOKEN_INVALID: ErrorBody = { msg: 'Token inválido' }
  static readonly TOKEN_MISSING: ErrorBody = { msg: 'Token de autenticação não informado' }
  static readonly UNAUTHORIZED: ErrorBody = { msg: 'Acesso não autorizado' }
  static readonly FORBIDDEN: ErrorBody = { msg: 'Sem permissão para esta ação' }

  // ── Users ──
  static readonly USER_NOT_FOUND: ErrorBody = { msg: 'Usuário não encontrado' }
  static readonly USER_INACTIVE: ErrorBody = { msg: 'Esta conta está desativada' }
  static readonly EMAIL_ALREADY_EXISTS: ErrorBody = { msg: 'Este email já está cadastrado' }

  // ── Events ──
  static readonly EVENT_NOT_FOUND: ErrorBody = { msg: 'Evento não encontrado' }
  static readonly EVENT_NOT_OWNER: ErrorBody = {
    msg: 'Apenas o organizador dono pode editar este evento',
  }
  static readonly EVENT_NOT_ONSALE: ErrorBody = { msg: 'Evento não está em período de vendas' }
  static readonly EVENT_CANCELED: ErrorBody = { msg: 'Este evento foi cancelado' }
  static readonly EVENT_ALREADY_IMPORTED: ErrorBody = {
    msg: 'Este evento da Ticketmaster já foi importado',
  }

  // ── Tickets ──
  static readonly SOLD_OUT: ErrorBody = { msg: 'Ingressos esgotados para este evento' }
  static readonly SEAT_TAKEN: ErrorBody = { msg: 'Este assento já está reservado' }
  static readonly TICKET_NOT_FOUND: ErrorBody = { msg: 'Ingresso não encontrado' }
  static readonly TICKET_NOT_OWNER: ErrorBody = { msg: 'Este ingresso não pertence a você' }

  // ── Gate (Portaria) ──
  static readonly TICKET_INVALID: ErrorBody = { msg: 'Ingresso inválido' }
  static readonly TICKET_ALREADY_USED: ErrorBody = { msg: 'Este ingresso já foi utilizado' }
  static readonly TICKET_WRONG_EVENT: ErrorBody = {
    msg: 'Este ingresso não pertence a este evento',
  }

  // ── Orders ──
  static readonly ORDER_NOT_FOUND: ErrorBody = { msg: 'Pedido não encontrado' }
  static readonly PAYMENT_FAILED: ErrorBody = { msg: 'Pagamento recusado' }
  static readonly ORDER_ALREADY_PAID: ErrorBody = { msg: 'Este pedido já foi pago' }
  static readonly ORDER_NOT_OWNER: ErrorBody = { msg: 'Este pedido não pertence a você' }

  // ── Share ──
  static readonly SHARE_TOKEN_INVALID: ErrorBody = { msg: 'Link de compartilhamento inválido' }
  static readonly SHARE_TOKEN_EXPIRED: ErrorBody = { msg: 'Link de compartilhamento expirado' }
  static readonly SHARE_ALREADY_CLAIMED: ErrorBody = { msg: 'Este ingresso já foi resgatado' }

  // ── Catálogo externo (Ticketmaster) ──
  static readonly CATALOG_UNAVAILABLE: ErrorBody = {
    msg: 'Catálogo externo indisponível no momento',
  }
  static readonly CATALOG_NOT_CONFIGURED: ErrorBody = {
    msg: 'Integração com a Ticketmaster não está configurada',
  }

  // ── Geral ──
  static readonly INTERNAL_ERROR: ErrorBody = { msg: 'Erro interno do servidor' }
  static readonly VALIDATION_ERROR: ErrorBody = { msg: 'Dados inválidos' }
  static readonly ROUTE_NOT_FOUND: ErrorBody = { msg: 'Rota não encontrada' }
  static readonly TOO_MANY_REQUESTS: ErrorBody = {
    msg: 'Muitas requisições. Tente novamente em instantes',
  }
}
