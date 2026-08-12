# Arquitetura Backend · ViaPass

> **Stack:** Node.js · Express · TypeORM · PostgreSQL · TypeScript
> **Versão:** 1.0 · Agosto 2026

---

## 1. Arquitetura: Modular por Feature + Service Layer

Arquitetura modular ao invés de MVC clássico. Em um projeto com 13 entidades e 3 perfis de usuário, agrupar por domínio (`modules/events/`, `modules/tickets/`) mantém a coesão — cada feature tem suas rotas, controller, service e entity na mesma pasta. A service layer isola regras de negócio dos controllers, facilitando testes unitários.

Combina o melhor de duas abordagens:

- **Modular/Feature-based:** Agrupa por domínio de negócio (events, tickets, orders…)
- **Service Layer:** Separa lógica de negócio dos controllers (HTTP ↔ Business ↔ Data)

```
Request → Middleware (auth, validation) → Controller → Service → Repository/Entity → DB
```

### Camadas

| Camada | Responsabilidade | Testa com |
|---|---|---|
| **Routes** | Declaração de rotas e middlewares | — |
| **Middlewares** | Auth, validação, rate limit, error handler | Unit test |
| **Controllers** | Parse request, chama service, formata response | Integration test |
| **Services** | Regras de negócio, orquestração | Unit test (principal) |
| **Entities** | Mapeamento TypeORM (tabelas) | — |
| **Repositories** | Queries customizadas (quando necessário) | — |

---

## 2. Estrutura de Pastas

```
viapass-backend/
│
├── src/
│   ├── config/                          # Configurações centralizadas
│   │   ├── database.ts                  #   TypeORM DataSource config
│   │   ├── env.ts                       #   Variáveis de ambiente (dotenv + validação)
│   │   ├── cors.ts                      #   CORS config
│   │   └── swagger.ts                   #   Swagger/OpenAPI config
│   │
│   ├── modules/                         # ══ Módulos de domínio (feature-based) ══
│   │   │
│   │   ├── auth/                        # ── Autenticação ──
│   │   │   ├── auth.routes.ts           #   POST /auth/login, /auth/register, /auth/refresh
│   │   │   ├── auth.controller.ts       #   Parse body, chama service, retorna token
│   │   │   ├── auth.service.ts          #   Login, registro, refresh token, hash senha
│   │   │   └── auth.dto.ts              #   LoginDTO, RegisterDTO (validação com class-validator)
│   │   │
│   │   ├── users/                       # ── Usuários ──
│   │   │   ├── user.routes.ts           #   GET /users/me, PUT /users/me
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.entity.ts           #   @Entity User (TypeORM)
│   │   │   └── user.dto.ts
│   │   │
│   │   ├── catalog/                     # ── Catálogo Ticketmaster ──
│   │   │   ├── catalog.routes.ts        #   GET /catalog/search, /catalog/events/:tmId
│   │   │   ├── catalog.controller.ts
│   │   │   └── catalog.service.ts       #   Chamadas à Discovery API, parse de resposta
│   │   │
│   │   ├── events/                      # ── Eventos ──
│   │   │   ├── event.routes.ts          #   CRUD /events, POST /events/import
│   │   │   ├── event.controller.ts
│   │   │   ├── event.service.ts         #   Criar, importar do TM, publicar, cancelar
│   │   │   ├── event.entity.ts          #   @Entity Event
│   │   │   ├── event.dto.ts             #   CreateEventDTO, UpdateEventDTO, ImportEventDTO
│   │   │   └── event.repository.ts      #   Queries com filtros, busca, paginação
│   │   │
│   │   ├── venues/                      # ── Locais ──
│   │   │   ├── venue.entity.ts          #   @Entity Venue
│   │   │   └── venue.service.ts         #   findOrCreate (upsert por tm_venue_id)
│   │   │
│   │   ├── attractions/                 # ── Atrações ──
│   │   │   ├── attraction.entity.ts     #   @Entity Attraction
│   │   │   └── attraction.service.ts    #   findOrCreate (upsert por tm_attraction_id)
│   │   │
│   │   ├── classifications/             # ── Classificações ──
│   │   │   ├── classification.entity.ts #   @Entity Classification
│   │   │   └── classification.service.ts
│   │   │
│   │   ├── orders/                      # ── Pedidos / Checkout ──
│   │   │   ├── order.routes.ts          #   POST /orders, GET /orders/my, POST /orders/:id/cancel
│   │   │   ├── order.controller.ts
│   │   │   ├── order.service.ts         #   Reserva atômica, pagamento simulado, cancelamento
│   │   │   ├── order.entity.ts          #   @Entity Order
│   │   │   ├── order-item.entity.ts     #   @Entity OrderItem
│   │   │   └── order.dto.ts             #   CreateOrderDTO
│   │   │
│   │   ├── tickets/                     # ── Ingressos ──
│   │   │   ├── ticket.routes.ts         #   GET /tickets/my, POST /tickets/:id/share
│   │   │   ├── ticket.controller.ts
│   │   │   ├── ticket.service.ts        #   Gerar QR, compartilhar, claim
│   │   │   ├── ticket.entity.ts         #   @Entity Ticket
│   │   │   ├── ticket-share.entity.ts   #   @Entity TicketShare
│   │   │   └── ticket.dto.ts
│   │   │
│   │   ├── gate/                        # ── Portaria (Validação) ──
│   │   │   ├── gate.routes.ts           #   POST /gate/validate
│   │   │   ├── gate.controller.ts
│   │   │   ├── gate.service.ts          #   Validar QR/código, registrar resultado
│   │   │   └── ticket-validation.entity.ts  #   @Entity TicketValidation
│   │   │
│   │   └── images/                      # ── Imagens de Eventos ──
│   │       ├── event-image.entity.ts    #   @Entity EventImage
│   │       └── price-range.entity.ts    #   @Entity PriceRange
│   │
│   ├── middlewares/                     # Cross-cutting concerns
│   │   ├── auth.middleware.ts           #   JWT verification (authGuard)
│   │   ├── role.middleware.ts           #   Role-based access (roleGuard)
│   │   ├── validate.middleware.ts       #   DTO validation via class-validator
│   │   ├── error-handler.middleware.ts  #   Error handler global (AppError → JSON)
│   │   └── rate-limit.middleware.ts     #   Rate limiting
│   │
│   ├── shared/                          # Código reutilizável
│   │   ├── errors/
│   │   │   ├── app-error.ts             #   Classe base AppError (statusCode, body: {msg})
│   │   │   ├── status-errors.ts         #   StatusErrors — códigos HTTP padronizados
│   │   │   └── response-errors.ts       #   ResponseErrors — mensagens {msg} por domínio
│   │   ├── utils/
│   │   │   ├── qr-code.util.ts          #   Geração de QR (HMAC-SHA256 + qrcode lib)
│   │   │   ├── pagination.util.ts       #   Helper de paginação TypeORM
│   │   │   └── token.util.ts            #   Geração de tokens seguros (share links)
│   │   ├── types/
│   │   │   ├── express.d.ts             #   Extensão do Request (req.user)
│   │   │   └── enums.ts                 #   UserRole, EventStatus, TicketStatus, OrderStatus…
│   │   └── constants/
│   │       └── index.ts                 #   Constantes da aplicação
│   │
│   ├── database/
│   │   ├── migrations/                  #   TypeORM migrations (versionadas)
│   │   └── seeds/                       #   Seeds de dados de teste
│   │       ├── seed-runner.ts           #   Executor dos seeds
│   │       ├── 01-users.seed.ts         #   Organizador, 2 clientes, portaria
│   │       ├── 02-venues.seed.ts        #   1 venue
│   │       ├── 03-events.seed.ts        #   1+ evento publicado
│   │       └── 04-tickets.seed.ts       #   Pool de ingressos disponíveis
│   │
│   ├── app.ts                           #   Express app setup (middlewares, routes, error handler)
│   └── server.ts                        #   Entry point (listen, TypeORM init)
│
├── docs/
│   ├── MER.md                           #   Modelo Entidade-Relacionamento
│   └── ARCHITECTURE.md                  #   Este documento
│
├── .env.example                         #   Template de variáveis de ambiente
├── .gitignore
├── tsconfig.json
├── package.json
└── README.md
```

---

## 3. Decisões de Design

### 3.1 Estratégia de Dados — Importação vs Consulta em Tempo Real

A Ticketmaster Discovery API é consultada **apenas no momento da importação** pelo organizador. Após importar, todos os dados ficam no banco local.

| Cenário | API em tempo real ❌ | Importação local ✅ |
|---|---|---|
| **Latência** | ~200-500ms por chamada | ~5ms query PostgreSQL |
| **Rate limit** | 5 req/s (free tier TM) — quebraria com tráfego real | Sem limite |
| **Disponibilidade** | Se TM cair, o app cai junto | App independente |
| **JOINs** | Impossível cruzar com tickets/orders | Natural via FK |
| **Customização** | Dados read-only | Organizador altera preço, capacidade, layout |

**Fluxo:**
1. `GET /catalog/search` — proxy para TM API (tempo real, usado só pelo organizador)
2. `POST /events/import` — persiste no banco local (venue, attractions, images, classifications)
3. `GET /events`, `GET /events/:id` — consulta banco local (usado por todos os perfis)

> A API externa funciona como catálogo de templates. Após importação, o ViaPass é a **fonte da verdade** para todos os dados.

### 3.2 Controller vs Service — quem faz o quê?

```typescript
// ❌ ERRADO — Controller inchado
class EventController {
  async create(req, res) {
    const venue = await venueRepo.findOne({ where: { tm_venue_id: req.body.tmVenueId } });
    if (!venue) {
      const newVenue = venueRepo.create({ ... });
      await venueRepo.save(newVenue);
    }
    const event = eventRepo.create({ ... });
    await eventRepo.save(event);
    for (let i = 0; i < req.body.capacity; i++) {
      // gera tickets...
    }
    res.json(event);
  }
}

// ✅ CORRETO — Controller magro, Service com lógica
class EventController {
  async create(req: Request, res: Response) {
    const dto = req.body as CreateEventDTO;
    const event = await eventService.create(dto, req.user.id);
    res.status(201).json(event);
  }
}

class EventService {
  async create(dto: CreateEventDTO, organizerId: string): Promise<Event> {
    const venue = await venueService.findOrCreate(dto.venue);
    const event = eventRepo.create({ ...dto, venue, organizerId });
    await eventRepo.save(event);
    await ticketService.generatePool(event);
    return event;
  }
}
```

### 3.3 Rotas — registro centralizado

```typescript
// src/modules/events/event.routes.ts
import { Router } from 'express';
import { authGuard } from '../../middlewares/auth.middleware';
import { roleGuard } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { EventController } from './event.controller';
import { CreateEventDTO } from './event.dto';

const router = Router();
const controller = new EventController();

router.get('/',                                              controller.list);
router.get('/:id',                                           controller.getById);
router.post('/',    authGuard, roleGuard(['organizer']), validate(CreateEventDTO), controller.create);
router.put('/:id',  authGuard, roleGuard(['organizer']),     controller.update);
router.delete('/:id', authGuard, roleGuard(['organizer']),   controller.delete);

export default router;
```

```typescript
// src/app.ts
import eventRoutes from './modules/events/event.routes';
import authRoutes from './modules/auth/auth.routes';
import orderRoutes from './modules/orders/order.routes';
import ticketRoutes from './modules/tickets/ticket.routes';
import gateRoutes from './modules/gate/gate.routes';
import catalogRoutes from './modules/catalog/catalog.routes';

app.use('/api/auth',    authRoutes);
app.use('/api/events',  eventRoutes);
app.use('/api/orders',  orderRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/gate',    gateRoutes);
app.use('/api/catalog', catalogRoutes);
```

---

## 4. Fluxo de Request

```
                    ┌─────────────────────────────────────────────┐
                    │              Express Pipeline               │
                    └─────────────────────────────────────────────┘

  HTTP Request
       │
       ▼
  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
  │  CORS    │ ──→ │  Rate    │ ──→ │  Body    │ ──→ │  Router  │
  │  Config  │     │  Limiter │     │  Parser  │     │  Match   │
  └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                          │
                                                          ▼
                                    ┌──────────┐     ┌──────────┐
                                    │  Role    │ ←── │  Auth    │
                                    │  Guard   │     │  Guard   │
                                    └──────────┘     └──────────┘
                                         │
                                         ▼
                                    ┌──────────┐
                                    │ Validate │  ← class-validator (DTO)
                                    │  (DTO)   │
                                    └──────────┘
                                         │
                                         ▼
  ┌──────────┐     ┌──────────┐     ┌──────────┐
  │ Response │ ←── │ Service  │ ←── │Controller│
  │  JSON    │     │ (lógica) │     │ (HTTP)   │
  └──────────┘     └──────────┘     └──────────┘
       │                │
       │                ▼
       │           ┌──────────┐     ┌──────────┐
       │           │  Entity  │ ──→ │PostgreSQL│
       │           │ (TypeORM)│     │          │
       │           └──────────┘     └──────────┘
       │
       ▼
  ┌──────────────┐
  │ Error Handler│  ← Captura AppError, retorna JSON padronizado
  │ (middleware) │
  └──────────────┘
```

---

## 5. Padrão de Erro e Resposta

Duas classes centralizam todos os erros da aplicação. Toda resposta de erro segue a estrutura `{ msg }`.

### 5.1 `StatusErrors` — Códigos HTTP padronizados

```typescript
// src/shared/errors/status-errors.ts
export class StatusErrors {
  static readonly BAD_REQUEST        = 400;
  static readonly UNAUTHORIZED       = 401;
  static readonly FORBIDDEN          = 403;
  static readonly NOT_FOUND          = 404;
  static readonly CONFLICT           = 409;
  static readonly UNPROCESSABLE      = 422;
  static readonly INTERNAL           = 500;
}
```

### 5.2 `ResponseErrors` — Mensagens centralizadas por domínio

```typescript
// src/shared/errors/response-errors.ts
export class ResponseErrors {
  // ── Auth ──
  static readonly INVALID_CREDENTIALS    = { msg: 'Email ou senha inválidos' };
  static readonly TOKEN_EXPIRED          = { msg: 'Token expirado, faça login novamente' };
  static readonly TOKEN_INVALID          = { msg: 'Token inválido' };
  static readonly UNAUTHORIZED           = { msg: 'Acesso não autorizado' };
  static readonly FORBIDDEN              = { msg: 'Sem permissão para esta ação' };

  // ── Users ──
  static readonly USER_NOT_FOUND         = { msg: 'Usuário não encontrado' };
  static readonly EMAIL_ALREADY_EXISTS   = { msg: 'Este email já está cadastrado' };

  // ── Events ──
  static readonly EVENT_NOT_FOUND        = { msg: 'Evento não encontrado' };
  static readonly EVENT_NOT_OWNER        = { msg: 'Apenas o organizador dono pode editar este evento' };
  static readonly EVENT_NOT_ONSALE       = { msg: 'Evento não está em período de vendas' };
  static readonly EVENT_CANCELED         = { msg: 'Este evento foi cancelado' };

  // ── Tickets ──
  static readonly SOLD_OUT               = { msg: 'Ingressos esgotados para este evento' };
  static readonly SEAT_TAKEN             = { msg: 'Este assento já está reservado' };
  static readonly TICKET_NOT_FOUND       = { msg: 'Ingresso não encontrado' };
  static readonly TICKET_NOT_OWNER       = { msg: 'Este ingresso não pertence a você' };

  // ── Gate (Portaria) ──
  static readonly TICKET_INVALID         = { msg: 'Ingresso inválido' };
  static readonly TICKET_ALREADY_USED    = { msg: 'Este ingresso já foi utilizado' };
  static readonly TICKET_WRONG_EVENT     = { msg: 'Este ingresso não pertence a este evento' };

  // ── Orders ──
  static readonly ORDER_NOT_FOUND        = { msg: 'Pedido não encontrado' };
  static readonly PAYMENT_FAILED         = { msg: 'Pagamento recusado' };
  static readonly ORDER_ALREADY_PAID     = { msg: 'Este pedido já foi pago' };

  // ── Share ──
  static readonly SHARE_TOKEN_INVALID    = { msg: 'Link de compartilhamento inválido' };
  static readonly SHARE_TOKEN_EXPIRED    = { msg: 'Link de compartilhamento expirado' };
  static readonly SHARE_ALREADY_CLAIMED  = { msg: 'Este ingresso já foi resgatado' };

  // ── General ──
  static readonly INTERNAL_ERROR         = { msg: 'Erro interno do servidor' };
  static readonly VALIDATION_ERROR       = { msg: 'Dados inválidos' };
}
```

### 5.3 Uso nos Services

```typescript
// Exemplo no ticket.service.ts
import { StatusErrors } from '../shared/errors/status-errors';
import { ResponseErrors } from '../shared/errors/response-errors';
import { AppError } from '../shared/errors/app-error';

if (!ticket) {
  throw new AppError(StatusErrors.NOT_FOUND, ResponseErrors.TICKET_NOT_FOUND);
}
if (ticket.status === 'used') {
  throw new AppError(StatusErrors.CONFLICT, ResponseErrors.TICKET_ALREADY_USED);
}
```

### 5.4 `AppError` — Classe base de exceção

```typescript
// src/shared/errors/app-error.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public body: { msg: string }
  ) {
    super(body.msg);
  }
}
```

### 5.5 Error Handler Middleware

```typescript
// src/middlewares/error-handler.middleware.ts
import { AppError } from '../shared/errors/app-error';
import { StatusErrors } from '../shared/errors/status-errors';
import { ResponseErrors } from '../shared/errors/response-errors';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.body);
  }
  console.error(err);
  return res.status(StatusErrors.INTERNAL).json(ResponseErrors.INTERNAL_ERROR);
}
```

> **Resposta de erro sempre retorna:** `{ msg: "texto do erro" }`. Nenhuma mensagem é escrita inline nos controllers — todas vêm da `ResponseErrors`.

## 6. Variáveis de Ambiente

```bash
# .env.example

# Server
PORT=3001
NODE_ENV=development

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=viapass
DB_PASSWORD=viapass_dev
DB_DATABASE=viapass

# JWT
JWT_SECRET=your-256-bit-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_REFRESH_EXPIRES_IN=7d

# Ticketmaster Discovery API
TM_API_KEY=your-ticketmaster-api-key
TM_API_BASE_URL=https://app.ticketmaster.com/discovery/v2

# QR Code / Ticket Security
TICKET_HMAC_SECRET=your-hmac-secret-for-tickets

# App
APP_BASE_URL=http://localhost:3000
```

---

## 7. TypeORM — Configuração

```typescript
// src/config/database.ts
import { DataSource } from 'typeorm';
import { env } from './env';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  synchronize: false,          // NUNCA true em produção
  logging: env.NODE_ENV === 'development',
  entities: ['src/modules/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: [],
});
```

> **Migrations, não synchronize.** Cada alteração de schema vira um arquivo versionado em `database/migrations/`.

---

## 8. Dependências Previstas

| Pacote | Propósito |
|---|---|
| `express` | Framework HTTP |
| `typeorm` + `pg` | ORM + driver PostgreSQL |
| `typescript` + `ts-node` + `tsx` | TypeScript runtime |
| `bcryptjs` | Hash de senhas |
| `jsonwebtoken` | JWT auth |
| `class-validator` + `class-transformer` | Validação de DTOs |
| `qrcode` | Geração de QR Code |
| `dotenv` | Variáveis de ambiente |
| `cors` | Cross-origin |
| `helmet` | Headers de segurança |
| `express-rate-limit` | Rate limiting |
| `uuid` | Geração de UUIDs |
| `axios` | Chamadas à Ticketmaster API |
| `swagger-jsdoc` + `swagger-ui-express` | Documentação da API |
| `jest` + `supertest` | Testes |
