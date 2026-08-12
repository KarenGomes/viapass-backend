# Progresso

Histórico do que foi feito, em ordem cronológica inversa. Regra em
[`rules/06-fluxo-de-trabalho.md`](rules/06-fluxo-de-trabalho.md).

---

## 2026-08-12 — Fundação, schema e ambiente Docker

Primeira entrega do back-end. O ambiente sobe, o banco conecta e o schema
completo está aplicado. **Nenhum módulo de negócio foi implementado** — por
pedido explícito de validar a infraestrutura primeiro.

### Feito

- Projeto Node 22 + Express 5 + TypeORM + TypeScript estrito.
- Estrutura modular por feature conforme `ARCHITECTURE.md`.
- `config/env.ts` com validação no boot: falta de variável ou segredo curto
  impede a aplicação de subir.
- As 12 entidades do `MER.md` + tabela de junção `event_attractions`.
- Migration inicial escrita à mão: 13 tabelas, 6 tipos ENUM, 3 CHECKs, índice
  parcial de assento, 20 índices e todas as FKs com `ON DELETE` explícito.
- `AppError` + `StatusErrors` + `ResponseErrors` e tratador de erros global.
- Swagger com respostas de sucesso e erro reutilizáveis, exemplos tirados da
  própria `ResponseErrors`.
- `GET /api/health` que executa `SELECT 1` no Postgres.
- Docker: Dockerfile multi-estágio (dev/build/prod) + compose com healthcheck
  em ambos os serviços.
- Jest + Supertest, com 45 testes.
- `CLAUDE.md` e seis arquivos de rules em `docs/rules/`.

### Decisões

**Registro explícito de entidades, não glob.** O `ARCHITECTURE.md §7` previa
`entities: ['src/modules/**/*.entity.ts']`. Isso resolve rodando via tsx e
falha em silêncio no contêiner de produção, que executa o JavaScript de
`dist/`: o DataSource sobe vazio e só quebra no primeiro request. Um arquivo
com imports explícitos resolve em qualquer runtime, é verificado pelo
compilador e concentra a lista num lugar só. Há teste de regressão.

**Sem alias de import (`@/`).** Cheguei a configurar `baseUrl` + `paths` e
removi: alias exige `tsc-alias` no build ou loader em runtime — mais uma peça
para quebrar em produção, pelo mesmo motivo do glob. Caminho relativo funciona
igual em tsx, no JS compilado e no Jest.

**SQL explícito na migration, não `migration:generate`.** O gerador não produz
índice parcial nem `CHECK`, que são justamente as garantias contra sobrevenda.
E a migration é o contrato do banco: precisa ser legível em revisão.

**`READ COMMITTED` + `UPDATE` condicional, não `SERIALIZABLE`.** O `MER §7.1`
sugeria `SERIALIZABLE` com `SELECT ... FOR UPDATE`. É redundante: o
`UPDATE events SET available_capacity = available_capacity - :qty WHERE
available_capacity >= :qty` já toma o lock de linha que serializa os pedidos
concorrentes. `SERIALIZABLE` só acrescentaria erros de serialização exigindo
lógica de retry, sem ganho.

**Health check que consulta o banco e devolve 503.** Endpoint que responde
"ok" porque o processo está vivo não serve para nada — o contêiner subir não
significa que ele alcança o Postgres. E o veredito vai no código HTTP, não só
no corpo, porque orquestrador e load balancer decidem pelo status.

**Valor monetário como `string`.** `decimal` chega como string no driver do
Postgres e assim fica. Converter para `number` introduz erro de ponto
flutuante em dinheiro.

**`password_hash` com `select: false`.** O hash fica fora de toda query que não
o peça explicitamente — inclusive das respostas serializadas por acidente.

**Express 5, não 4.** Encaminha promise rejeitada ao tratador de erros
automaticamente, o que elimina o `try/catch` repetido em todo controller async.

### Inconsistências encontradas na especificação

Todas comunicadas antes de implementar. As três primeiras foram corrigidas por
serem graves; as demais estão registradas.

| # | Onde | Problema | Resolução |
| --- | --- | --- | --- |
| 1 | `ARCHITECTURE §7` | Glob de entidades com `.ts` quebra no contêiner | ✅ Registro explícito em `database/entities.ts` |
| 2 | `MER §7.1` vs `§6.2` | Reserva fazia `INSERT INTO tickets`, mas o pool já é criado ao publicar | ✅ Reserva é `UPDATE available → reserved`; documentado na entidade e na regra 03 |
| 3 | `MER §3.2`/`§3.11` | `events.available_capacity` e `COUNT(tickets)` como duas fontes de verdade | ✅ `tickets` é a verdade; o contador é cache e só muda na mesma transação |
| 4 | `MER §5.1` | Refresh cookie `SameSite=Strict` quebra com domínios diferentes em produção | ⚠️ Registrado — decidir ao implementar o auth |
| 5 | `.env.example` | `APP_BASE_URL=localhost:3000`, mas o Vite roda em 5173 | ✅ Corrigido, com teste |
| 6 | `MER §3.10` | `order_items.ticket_id UNIQUE` impede revenda de ingresso cancelado | ⚠️ Mantido — a garantia contra sobrevenda vale mais que o caso raro |
| 7 | `ARCHITECTURE §2` | Módulo `images/` guardava `price-range.entity.ts` | ✅ Ambos movidos para `events/` — são filhos 1:N do evento, sem ciclo de vida próprio |
| 8 | `MER §7.1` | `SERIALIZABLE` + `FOR UPDATE` redundantes | ✅ `READ COMMITTED` + `UPDATE` condicional |

**Desvio menor:** `classifications`, `event_images` e `price_ranges` não
listavam `created_at` no MER. Incluí para uniformizar — custo zero.

**Sobre a Ticketmaster:** consultei a documentação oficial da Discovery API v2.
O mapeamento do `MER §6.3` está correto — base URL, `apikey` como query param e
os campos conferem. Dois limites que o MER não citava e que afetam a paginação:
**quota de 5.000 chamadas/dia** (além dos 5 req/s) e **paginação profunda
limitada a `size × page < 1000`**. Registrados em `shared/constants`.

### Dois bugs que os testes pegaram durante a implementação

- **Glob do Swagger com separador do Windows.** `path.join` devolve `\`, e o
  glob do `swagger-jsdoc` só entende `/`. Funcionaria no contêiner Linux e
  falharia na máquina de quem desenvolve, deixando a documentação vazia. O
  teste que verifica se `/health` aparece em `/docs.json` acusou.
- **`export default` a mais em `database.ts`.** O CLI do TypeORM recusa um
  arquivo com mais de um export de `DataSource` — export nomeado + default
  contam como dois. Só apareceu ao rodar a migration dentro do contêiner.

### Fora de escopo nesta entrega

- **Módulos de negócio** — auth, users, catalog, events, orders, tickets, gate.
  Pedido explícito de validar o ambiente primeiro.
- **Seeds** — dependem das entidades de negócio estarem operando.
- **Integração real com a Ticketmaster** — sem `TM_API_KEY` configurada.
- **Testes com banco real** — os atuais usam dublê; a conexão é validada pelo
  healthcheck do Docker.

### Verificação

```
npm run typecheck                     → sem erros
npm test                              → 45 testes, 6 suítes, todos passando
docker compose up -d --build          → viapass-postgres healthy
                                        viapass-api healthy
docker compose exec api npm run migration:run
                                      → InitialSchema executada com sucesso
psql \dt                              → 14 tabelas (13 + migrations)
psql enums                            → 6 tipos ENUM corretos
GET /api/health                       → 200 {"status":"ok",
                                              "database":{"status":"up","latencyMs":1}}
GET /api/rota-inexistente             → 404 {"msg":"Rota não encontrada"}
GET /docs.json                        → openapi 3.0.3, 9 respostas de erro
headers                               → HSTS, nosniff, SAMEORIGIN, sem x-powered-by
```
