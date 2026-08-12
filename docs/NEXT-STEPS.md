# Próximos passos

Fila de trabalho. Cada item deve ser específico o bastante para alguém que
nunca viu o projeto começar sem perguntar nada.

---

## Concluído — 2026-08-12

- [x] Subir Node + Express + TypeORM + TypeScript estrito
- [x] Validação de variáveis de ambiente no boot
- [x] As 12 entidades do MER + junção `event_attractions`
- [x] Migration inicial com CHECKs, índice parcial e FKs
- [x] `AppError` + `StatusErrors` + `ResponseErrors` + tratador global
- [x] Swagger com respostas de sucesso e erro reutilizáveis
- [x] `GET /api/health` validando a conexão real com o Postgres
- [x] Docker Compose com healthcheck em ambos os serviços
- [x] Jest + Supertest com 45 testes
- [x] `CLAUDE.md` e as rules em `docs/rules/`

---

## 1 — Autenticação (bloqueia todo o resto)

- [ ] `auth.service`: registro com bcrypt 12 rounds e login emitindo access + refresh
- [ ] `authGuard`: valida o JWT e popula `req.user` (estender o tipo em `shared/types/express.d.ts`)
- [ ] `roleGuard(['organizer'])`: autorização por papel conforme a matriz do `MER §5.2`
- [ ] `validate(DTO)`: middleware de `class-validator` devolvendo `{ msg }` no formato padrão
- [ ] **Decidir o `SameSite` do refresh cookie** — `Strict` quebra em produção com domínios diferentes (inconsistência #4)
- [ ] `POST /auth/refresh` e `POST /auth/logout`
- [ ] Testes: credencial errada, token expirado, token de outro papel

## 2 — Catálogo Ticketmaster

- [ ] `catalog.service` com axios: `GET /events` da Discovery API
- [ ] Respeitar os limites: 5 req/s, 5.000/dia, `size × page < 1000` (já em `shared/constants`)
- [ ] Tratar 401 do TM como `CATALOG_NOT_CONFIGURED` e 5xx/timeout como `CATALOG_UNAVAILABLE`
- [ ] `GET /api/catalog/search` restrito a `organizer`
- [ ] Testes com axios mockado — a suíte não pode depender da API externa

## 3 — Eventos

- [ ] `venue.service.findOrCreate` e `attraction.service.findOrCreate` (upsert por `tm_*_id`)
- [ ] `POST /api/events/import`: persiste venue, attractions, classification, imagens e faixas de preço
- [ ] `PUT /api/events/:id`: capacidade, `seat_map_config` e preço final (só o organizador dono)
- [ ] `PUT /api/events/:id/publish`: gera o pool de tickets com `code` e `qr_hash`, muda status
- [ ] `GET /api/events` com busca, filtro e paginação
- [ ] `GET /api/events/:id` com relações carregadas

## 4 — Reserva e checkout

- [ ] `POST /api/orders` com a transação anti-sobrevenda da regra 03
- [ ] Pagamento simulado cobrindo **confirmação e recusa** (o desafio exige os dois)
- [ ] `POST /api/orders/:id/cancel` devolvendo os ingressos ao pool
- [ ] `GET /api/orders/my`
- [ ] **Teste de concorrência**: dois pedidos simultâneos no último assento — só um pode passar

## 5 — Ingressos e portaria

- [ ] `qr-code.util`: gerar e conferir `HMAC_SHA256(id + ':' + code, TICKET_HMAC_SECRET)`
- [ ] `GET /api/tickets/my` com o QR em data URI
- [ ] `POST /api/tickets/:id/share` gerando token de 32 bytes com validade de 48h
- [ ] `POST /api/tickets/claim/:token` transferindo a posse
- [ ] `POST /api/gate/validate` com os quatro retornos: `valid`, `invalid`, `already_used`, `wrong_event`
- [ ] Registrar **toda** tentativa em `ticket_validations`, inclusive as recusadas
- [ ] Teste: validar o mesmo ingresso duas vezes devolve `already_used` na segunda

## 6 — Seeds (requisito do desafio)

- [ ] `seed-runner` idempotente — rodar duas vezes não pode duplicar
- [ ] 1 organizador, 2 clientes, 1 portaria com as credenciais do `MER §8`
- [ ] 1 venue e ao menos 1 evento publicado com pool de ingressos disponível
- [ ] Adicionar ao compose como serviço opcional (`profiles: [seed]`)

## 7 — Qualidade

- [ ] Testes de integração com banco real (Testcontainers ou Postgres de teste no compose)
- [ ] Logger estruturado substituindo `console.log`
- [ ] Cobertura acima do piso nos módulos de negócio

## 8 — Entrega

- [ ] `README` da raiz cobrindo front + back
- [ ] Compose único na raiz subindo front, back e banco
- [ ] Deploy (vale 1 ponto na nota do desafio)
- [ ] `docs/USO-DE-IA.md`, como já existe no front-end

---

## Riscos e dúvidas em aberto

| # | Assunto | Situação |
| --- | --- | --- |
| 1 | **`SameSite` do refresh cookie** — `Strict` funciona em localhost (mesmo site, portas diferentes) e quebra em produção com domínios distintos | Decidir na tarefa 1 |
| 2 | **`order_items.ticket_id UNIQUE`** impede que um ingresso cancelado gere um segundo item | Mantido de propósito; se cancelamento com revenda entrar no escopo, o caminho é emitir um ticket novo em vez de reaproveitar |
| 3 | **Mapa de assentos vs. pista** — o desafio permite um dos dois; o schema suporta os dois via `seat_type` | Definir antes da tarefa 3 |
| 4 | **Sem `TM_API_KEY`** — a integração real não foi exercitada | Chave gratuita em developer.ticketmaster.com |
| 5 | **`event_status_enum` tem `published` e `onsale`** — dois estados quase iguais | Definir a transição exata na tarefa 3, ou fundir os dois |
| 6 | **Contrato com o front-end** — o front já tem design system, mas nenhuma tela consome a API | O Swagger em `/docs.json` é o contrato; manter atualizado a cada rota |
| 7 | **Volume do Postgres persiste entre `docker compose down`** — mudança de senha no `.env` não é aplicada a volume existente | Usar `docker compose down -v` ao trocar credenciais |
