# ViaPass — Back-End

API da plataforma de eventos e ingressos ViaPass (Desafio Elite Dev).

> **Estado atual:** fundação, schema completo e ambiente Docker prontos e
> validados. **Nenhum módulo de negócio foi implementado ainda** — auth,
> eventos, pedidos, ingressos e portaria estão em
> [`docs/NEXT-STEPS.md`](docs/NEXT-STEPS.md).
> A única rota funcional é `GET /api/health`.

---

## Subir com Docker (recomendado)

Requisito: Docker Desktop rodando.

**1. Crie o `.env` a partir do template**

```bash
cp .env.example .env
```

**2. Gere segredos reais** — a aplicação recusa subir com segredo de menos de 32 caracteres

```bash
node -e "const c=require('crypto');['JWT_SECRET','JWT_REFRESH_SECRET','TICKET_HMAC_SECRET'].forEach(k=>console.log(k+'='+c.randomBytes(32).toString('hex')))"
```

Cole os três valores no `.env`.

**3. Suba o ambiente**

```bash
docker compose up -d --build
```

**4. Aplique o schema**

```bash
docker compose exec api npm run migration:run
```

**5. Confirme**

```bash
curl http://localhost:3001/api/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "database": { "status": "up", "latencyMs": 1 },
  "uptime": 12.4,
  "timestamp": "2026-08-12T13:36:18.229Z",
  "version": "1.0.0"
}
```

| Serviço | Endereço |
| --- | --- |
| API | http://localhost:3001/api |
| Documentação (Swagger UI) | http://localhost:3001/docs |
| OpenAPI cru | http://localhost:3001/docs.json |
| PostgreSQL | `localhost:5432` |

Hot reload está ligado: `./src` é montado como volume e o `tsx watch` recarrega
a cada alteração.

### Comandos úteis

```bash
docker compose logs -f api
```

```bash
docker compose exec postgres psql -U viapass -d viapass -c "\dt"
```

```bash
docker compose down -v
```

> `-v` apaga o volume do banco. Necessário ao trocar as credenciais no `.env`:
> o Postgres só lê `POSTGRES_PASSWORD` na primeira inicialização do volume.

---

## Rodar sem Docker

Requisitos: Node 20+ e um PostgreSQL 16 acessível.

```bash
npm install
```

Ajuste `DB_HOST=localhost` no `.env` e então:

```bash
npm run migration:run
```

```bash
npm run dev
```

---

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor com hot reload |
| `npm run build` | Compila para `dist/` |
| `npm start` | Roda o build |
| `npm run typecheck` | Checagem de tipos |
| `npm test` | Suíte completa |
| `npm run test:coverage` | Com cobertura |
| `npm run verify` | lint + tipos + testes |
| `npm run migration:run` | Aplica migrations pendentes |
| `npm run migration:revert` | Desfaz a última |
| `npm run migration:show` | Lista o que já rodou |

---

## Stack e por quê

| Escolha | Motivo |
| --- | --- |
| **Node 22 + Express 5** | Express 5 encaminha promise rejeitada ao tratador de erros sozinho, eliminando `try/catch` repetido em todo controller async |
| **TypeScript estrito** | Com `noUncheckedIndexedAccess` — acesso a índice é o erro mais comum ao lidar com listas de assentos |
| **TypeORM + PostgreSQL** | Definido em `ARCHITECTURE.md`. Postgres pelo que o modelo exige: índice parcial, `CHECK`, `JSONB` e tipos ENUM |
| **Migrations, nunca `synchronize`** | Schema por inferência esconde o que mudou e não sobrevive à primeira divergência entre máquinas |
| **Jest + Supertest** | Definido em `ARCHITECTURE.md`. `--runInBand` porque testes de banco em paralelo disputam as mesmas linhas |

---

## Arquitetura

Modular por feature + service layer:

```
Request → Middlewares → Controller → Service → Entity → PostgreSQL
```

```
src/
├── config/      env validado, DataSource, CORS, Swagger
├── modules/     um diretório por domínio
├── middlewares/ auth, papel, validação, rate limit, erro
├── shared/      errors, types, constants, utils, base entity
├── database/    entities.ts (registro), migrations/, seeds/
├── app.ts       montagem do Express
└── server.ts    boot, conexão, encerramento gracioso
```

Detalhes em [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) e
[`docs/rules/02-arquitetura.md`](docs/rules/02-arquitetura.md).

## Banco de dados

13 tabelas, 6 tipos ENUM. Modelo completo em [`docs/MER.md`](docs/MER.md).

A integridade é garantida pelo banco, não pela aplicação:

| Garantia | Mecanismo |
| --- | --- |
| Mesmo assento não vendido duas vezes | Índice parcial `uq_tickets_seat` |
| Ingresso em um pedido só | `UNIQUE (ticket_id)` em `order_items` |
| Capacidade nunca negativa nem acima do total | Três `CHECK` em `events` |
| Evento sempre com local e organizador | `NOT NULL` + FK `ON DELETE RESTRICT` |

---

## Erros

Toda resposta de erro tem o mesmo corpo:

```json
{ "msg": "Este assento já está reservado" }
```

As mensagens são centralizadas em `shared/errors/response-errors.ts` — nenhuma
é escrita inline. Erro inesperado vira `500` genérico e o detalhe fica só no
log: `relation "tickets" does not exist` entregaria ao atacante o nome da
tabela e o SGBD. Há teste verificando que esse vazamento não acontece.

Cada status e quando usá-lo: [`docs/rules/04-erros-e-api.md`](docs/rules/04-erros-e-api.md).

---

## Testes

**45 testes** cobrindo o que existe hoje:

| Suíte | Verifica |
| --- | --- |
| `health.service` | Consulta real ao banco, degradação, não vazamento de credencial |
| `error-handler` | Tradução de `AppError`, 500 genérico, ausência de vazamento |
| `app` (Supertest) | Rotas, 404 em JSON, headers do helmet, CORS, contrato do Swagger |
| `entities` | Registro explícito completo, `synchronize` desligado |
| `env` | Segredos longos, distintos entre si, URL do front correta |
| `app-error` | Formato `{ msg }` e ausência de mensagens duplicadas |

```bash
npm test
```

A conexão real com o Postgres é validada pelo healthcheck do Docker e por
`GET /api/health`, não por dublê.

---

## Documentação

| Arquivo | Conteúdo |
| --- | --- |
| [`CLAUDE.md`](CLAUDE.md) | Ordens permanentes para IA neste repositório |
| [`docs/rules/`](docs/rules/README.md) | Persona, arquitetura, banco, erros, testes, fluxo |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Especificação de origem da arquitetura |
| [`docs/MER.md`](docs/MER.md) | Especificação de origem do modelo de dados |
| [`docs/PROGRESSO.md`](docs/PROGRESSO.md) | O que foi feito, decisões e inconsistências resolvidas |
| [`docs/NEXT-STEPS.md`](docs/NEXT-STEPS.md) | Fila de trabalho, riscos e dúvidas |

> `ARCHITECTURE.md` e `MER.md` são especificação, não código. Onde divergirem
> da implementação, o código vence — e o porquê está em `PROGRESSO.md`.

---

## Limitações conhecidas

- **Só `GET /api/health` funciona.** Auth, eventos, pedidos, ingressos e
  portaria ainda não existem.
- **Sem seeds.** Dependem dos módulos de negócio.
- **Sem `TM_API_KEY`.** A integração com a Ticketmaster não foi exercitada
  contra a API real. Chave gratuita em developer.ticketmaster.com.
- **Testes usam dublê de banco.** Testes de integração com Postgres real estão
  na fila.
- **A especificação tem 8 inconsistências**, 4 corrigidas e 4 registradas.
  Todas listadas em [`docs/PROGRESSO.md`](docs/PROGRESSO.md).
