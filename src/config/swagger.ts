import path from 'node:path'
import swaggerJsdoc from 'swagger-jsdoc'
import type { OAS3Definition, Options } from 'swagger-jsdoc'
import { env } from './env'
import { ResponseErrors } from '../shared/errors/response-errors'
import {
  EventStatus,
  OrderStatus,
  SeatType,
  TicketStatus,
  UserRole,
  ValidationResult,
} from '../shared/types/enums'

/**
 * Especificação OpenAPI 3.0 da API.
 *
 * O contrato aqui é o que o front-end consome para saber o que esperar. Por
 * isso as respostas de erro são componentes reutilizáveis com exemplo real
 * (o texto vem da própria `ResponseErrors`, não de um texto inventado na
 * documentação): se a mensagem mudar no código, o exemplo muda junto.
 */

/** Monta uma resposta de erro reutilizável a partir da mensagem real do código. */
function errorResponse(description: string, ...examples: Array<{ msg: string }>) {
  const [first] = examples

  return {
    description,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
        examples: Object.fromEntries(
          examples.map((example, index) => [
            `exemplo${index + 1}`,
            { summary: example.msg, value: example },
          ]),
        ),
        example: first,
      },
    },
  }
}

const definition: OAS3Definition = {
  openapi: '3.0.3',
  info: {
    title: 'ViaPass API',
    version: '1.0.0',
    description: [
      'API da plataforma de eventos e ingressos ViaPass.',
      '',
      '## Perfis de acesso',
      '- **organizer** — cria e gerencia eventos, importa do catálogo Ticketmaster',
      '- **client** — reserva, paga (simulado), recebe e compartilha ingressos',
      '- **gate** — valida ingressos na entrada do evento',
      '',
      '## Autenticação',
      'Envie o access token no header `Authorization: Bearer <token>`.',
      'O access token dura 15 minutos; o refresh token viaja em cookie HttpOnly.',
      '',
      '## Formato de erro',
      'Toda resposta de erro tem o mesmo corpo: `{ "msg": "descrição do erro" }`.',
      'Nenhum endpoint devolve stack trace ou detalhe interno.',
    ].join('\n'),
    contact: { name: 'ViaPass' },
  },
  servers: [
    { url: `http://localhost:${env.PORT}/api`, description: 'Desenvolvimento local' },
  ],
  tags: [
    { name: 'Health', description: 'Estado da aplicação e do banco' },
    { name: 'Auth', description: 'Login, registro e renovação de token' },
    { name: 'Users', description: 'Perfil do usuário autenticado' },
    { name: 'Catalog', description: 'Busca no catálogo da Ticketmaster (organizador)' },
    { name: 'Events', description: 'Eventos publicados e gestão pelo organizador' },
    { name: 'Orders', description: 'Checkout e pagamento simulado' },
    { name: 'Tickets', description: 'Ingressos do cliente, QR Code e compartilhamento' },
    { name: 'Gate', description: 'Validação de ingressos na portaria' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token obtido em `POST /api/auth/login`.',
      },
    },

    schemas: {
      ErrorResponse: {
        type: 'object',
        required: ['msg'],
        properties: {
          msg: {
            type: 'string',
            description: 'Mensagem pronta para exibição ao usuário final.',
            example: ResponseErrors.EVENT_NOT_FOUND.msg,
          },
        },
      },

      HealthResponse: {
        type: 'object',
        required: ['status', 'database', 'uptime', 'timestamp'],
        properties: {
          status: { type: 'string', enum: ['ok', 'degraded'], example: 'ok' },
          database: {
            type: 'object',
            required: ['status'],
            properties: {
              status: { type: 'string', enum: ['up', 'down'], example: 'up' },
              latencyMs: { type: 'integer', nullable: true, example: 3 },
            },
          },
          uptime: { type: 'number', description: 'Segundos desde o boot', example: 128.4 },
          timestamp: { type: 'string', format: 'date-time' },
          version: { type: 'string', example: '1.0.0' },
        },
      },

      PaginationMeta: {
        type: 'object',
        required: ['page', 'size', 'totalItems', 'totalPages'],
        properties: {
          page: { type: 'integer', minimum: 1, example: 1 },
          size: { type: 'integer', minimum: 1, maximum: 100, example: 20 },
          totalItems: { type: 'integer', example: 137 },
          totalPages: { type: 'integer', example: 7 },
        },
      },

      // Enums expostos para o front-end derivar tipos sem adivinhar strings.
      UserRole: { type: 'string', enum: Object.values(UserRole), example: UserRole.CLIENT },
      EventStatus: {
        type: 'string',
        enum: Object.values(EventStatus),
        example: EventStatus.ONSALE,
      },
      SeatType: { type: 'string', enum: Object.values(SeatType), example: SeatType.MAPPED },
      OrderStatus: {
        type: 'string',
        enum: Object.values(OrderStatus),
        example: OrderStatus.PAID,
      },
      TicketStatus: {
        type: 'string',
        enum: Object.values(TicketStatus),
        example: TicketStatus.SOLD,
      },
      ValidationResult: {
        type: 'string',
        enum: Object.values(ValidationResult),
        description: [
          'Resultado da validação na portaria:',
          '- `valid` — ingresso aceito, marcado como utilizado',
          '- `invalid` — código não existe ou assinatura não confere',
          '- `already_used` — já foi validado antes',
          '- `wrong_event` — pertence a outro evento',
        ].join('\n'),
        example: ValidationResult.VALID,
      },
    },

    responses: {
      BadRequest: errorResponse(
        'Requisição malformada ou dados inválidos.',
        ResponseErrors.VALIDATION_ERROR,
      ),
      Unauthorized: errorResponse(
        'Token ausente, inválido ou expirado.',
        ResponseErrors.TOKEN_MISSING,
        ResponseErrors.TOKEN_EXPIRED,
        ResponseErrors.TOKEN_INVALID,
        ResponseErrors.INVALID_CREDENTIALS,
      ),
      Forbidden: errorResponse(
        'Autenticado, mas sem permissão para esta ação.',
        ResponseErrors.FORBIDDEN,
        ResponseErrors.EVENT_NOT_OWNER,
        ResponseErrors.TICKET_NOT_OWNER,
      ),
      NotFound: errorResponse(
        'Recurso não encontrado.',
        ResponseErrors.EVENT_NOT_FOUND,
        ResponseErrors.TICKET_NOT_FOUND,
        ResponseErrors.ORDER_NOT_FOUND,
        ResponseErrors.USER_NOT_FOUND,
      ),
      Conflict: errorResponse(
        'Conflito com o estado atual do recurso.',
        ResponseErrors.SEAT_TAKEN,
        ResponseErrors.SOLD_OUT,
        ResponseErrors.EMAIL_ALREADY_EXISTS,
        ResponseErrors.TICKET_ALREADY_USED,
        ResponseErrors.ORDER_ALREADY_PAID,
      ),
      UnprocessableEntity: errorResponse(
        'Requisição bem formada, mas recusada por regra de negócio.',
        ResponseErrors.PAYMENT_FAILED,
        ResponseErrors.EVENT_NOT_ONSALE,
        ResponseErrors.SHARE_TOKEN_EXPIRED,
      ),
      TooManyRequests: errorResponse(
        'Limite de requisições excedido.',
        ResponseErrors.TOO_MANY_REQUESTS,
      ),
      InternalError: errorResponse(
        'Falha inesperada no servidor. O detalhe fica no log, nunca na resposta.',
        ResponseErrors.INTERNAL_ERROR,
      ),
      BadGateway: errorResponse(
        'Falha ao consultar a Ticketmaster.',
        ResponseErrors.CATALOG_UNAVAILABLE,
      ),
    },
  },

  security: [{ bearerAuth: [] }],
}

/**
 * `path.join` devolve `\` no Windows, mas glob só entende `/` como separador —
 * o padrão casaria no contêiner Linux e falharia silenciosamente na máquina de
 * quem desenvolve, deixando o Swagger sem nenhuma rota.
 */
const modulesGlob = (extension: string): string =>
  path.join(__dirname, '..', 'modules', '**', `*.routes.${extension}`).replace(/\\/g, '/')

const options: Options = {
  definition,
  /**
   * As duas extensões de propósito: em desenvolvimento o tsx lê os `.ts`; no
   * contêiner, o Node lê os `.js` compilados. Um glob só com `.ts` deixaria a
   * documentação vazia em produção — a mesma armadilha do glob de entidades.
   */
  apis: [modulesGlob('ts'), modulesGlob('js')],
}

export const swaggerSpec = swaggerJsdoc(options)
