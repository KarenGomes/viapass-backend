# ViaPass — Back-End

API da plataforma de eventos e ingressos ViaPass (Desafio Elite Dev).

> **Estado atual:** todos os requisitos de back-end do desafio estão
> implementados e cobertos por testes. 33 operações em 28 rotas, 153 testes
> passando. Um `docker compose up` sobe a API já com o banco populado.

---

## O que está pronto

Cada item do desafio e onde ele vive no código.

| Requisito do desafio | Situação | Onde |
| --- | --- | --- |
| Integração com API externa (Ticketmaster Discovery) | ✅ | `modules/catalog/` — cliente com limite de 5 req/s, mapeador e importação |
| Autenticação com três papéis | ✅ | `modules/auth/` — JWT access 15min + refresh 7d, bcrypt |
| Armazenamento de eventos, reservas e ingressos | ✅ | `modules/events/`, `modules/orders/`, `modules/tickets/` |
| Mesmo lugar não vendido duas vezes | ✅ | Reserva em transação com `SELECT … FOR UPDATE` |
| QR que não pode ser forjado | ✅ | HMAC-SHA256 em `shared/utils/qr-code.util.ts` |
| Compartilhamento de ingresso por link | ✅ | `POST /tickets/{id}/share`, resgate único, TTL de 48h |
| Validação na portaria, sem revalidar | ✅ | `modules/gate/` — válido, inválido, já utilizado, evento errado |
| Pagamento simulado, com confirmação **e** recusa | ✅ | `modules/orders/payment.service.ts` — final `0000` recusa |
| Dados de teste semeados | ✅ | 4 usuários e 30 eventos reais publicados (ver abaixo) |

Opcionais do desafio também entregues: painel do organizador, busca e filtro de
eventos, cancelamento com devolução ao estoque, Docker Compose e testes.

**Fora do escopo pedido**, feito porque o fluxo pedia: upload de capa do evento
(`modules/upload/`) e listagem de cidades para o filtro da home.

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

O contêiner aplica as migrations e roda a seed antes de servir. O primeiro boot
leva ~40s (schema + 30 eventos + ~6.200 ingressos); os seguintes são rápidos,
porque a seed é idempotente e reaproveita o que já existe.

**4. Confirme**

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
>
> **Atenção:** o `-v` apaga o banco inteiro. A seed repõe os usuários e o
> catálogo de eventos, mas **não** o que tiver sido criado pela interface —
> eventos, pedidos e ingressos cadastrados à mão se perdem. Sem o `-v`, o
> volume é preservado.

### Catálogo de eventos

A seed popula 30 eventos reais da Ticketmaster, versionados em
`src/database/seeds/fixtures/`. Ela roda offline: não precisa de `TM_API_KEY`
nem de rede, e duas execuções produzem o mesmo banco.

Para renovar o catálogo (aí sim exige `TM_API_KEY` válida no `.env`):

```bash
npm run seed:capture
```

O script busca eventos na Discovery API, regrava a fixture e imprime o que
capturou. Depois, `npm run seed` aplica ao banco — ou basta subir o contêiner.

---

## Publicar (Render, Fly, Railway)

Hospedagem que constrói a imagem direto do Dockerfile **não lê o
`docker-compose.yml`**. O `CMD` do estágio `production` já cobre isso: roda
migrations, depois a seed, depois o servidor. Não é preciso configurar comando
de start, nem `BUILD_TARGET` — o último estágio do Dockerfile é o de produção.

Também **não crie um `.env` de produção**: ele está no `.dockerignore` e não
entraria na imagem. As variáveis vão no painel do provedor.

O mínimo para subir:

```
DATABASE_URL        postgresql://usuario:senha@host:5432/banco
JWT_SECRET          32+ caracteres
JWT_REFRESH_SECRET  32+ caracteres, diferente do anterior
TICKET_HMAC_SECRET  32+ caracteres
CORS_ORIGINS        https://url-do-front-end
APP_BASE_URL        https://url-do-front-end
```

No lugar de `DATABASE_URL`, dá para usar `DB_HOST`, `DB_PORT`, `DB_USERNAME`,
`DB_PASSWORD` e `DB_DATABASE`. Use o endereço **interno** do banco quando o
provedor oferecer; o externo costuma exigir `DB_SSL=true`.

`PORT` não precisa ser definida — o provedor injeta e a aplicação respeita.

Gere os segredos com:

```bash
node -e "const c=require('crypto');['JWT_SECRET','JWT_REFRESH_SECRET','TICKET_HMAC_SECRET'].forEach(k=>console.log(k+'='+c.randomBytes(32).toString('hex')))"
```

> **Disco efêmero.** Onde não há volume persistente, as capas enviadas pelo
> organizador somem a cada restart — as linhas ficam no banco apontando para
> arquivos que não existem mais. A seed repõe o catálogo, não os uploads.

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

**153 testes** em 13 suítes:

| Suíte | Verifica |
| --- | --- |
| `auth.service` | Registro, login, refresh, hash da senha, papéis |
| `route-policy` | Toda rota declara política de acesso — reprova se faltar |
| `order-pricing` | Taxa de serviço, proteção, soma por ingresso |
| `payment.service` | Aprovação e recusa do gateway simulado |
| `gate.service` | Válido, inválido, já utilizado, evento errado |
| `qr-code.util` | Assinatura HMAC e detecção de código adulterado |
| `ticketmaster.mapper` | Mapeamento da Discovery API, campos omitidos, grafia de cidade |
| `app` (Supertest) | Rotas, 404 em JSON, headers do helmet, CORS, contrato do Swagger |
| `health.service` | Consulta real ao banco, degradação, não vazamento de credencial |
| `error-handler` | Tradução de `AppError`, 500 genérico, ausência de vazamento |
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

- **Nenhum evento do catálogo tem descrição.** A Discovery API não retorna
  `info` nem `pleaseNote` em nenhum dos 30 eventos brasileiros capturados, e
  também não fornece preço (`priceRanges` vem vazio). O preço de venda é
  derivado do segmento na seed, como o organizador faria.
- **Testes usam dublê de banco.** A conexão real é validada pelo healthcheck do
  Docker e por `GET /api/health`, não por teste de integração com Postgres.
- **Limite de 5 req/s da Ticketmaster é em memória.** Com várias instâncias da
  API em paralelo o controle não vale; exigiria contador compartilhado (Redis).
  Como a importação é ação pontual do organizador, não se justificou aqui.
- **Upload em disco local.** Em hospedagem sem disco persistente, as capas
  enviadas somem no restart. Registrado em
  [`docs/NEXT-STEPS.md`](docs/NEXT-STEPS.md).
- **A especificação tem 8 inconsistências**, 4 corrigidas e 4 registradas.
  Todas listadas em [`docs/PROGRESSO.md`](docs/PROGRESSO.md).
