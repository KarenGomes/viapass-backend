# Progresso

Histórico do que foi feito, em ordem cronológica inversa. Regra em
[`rules/06-fluxo-de-trabalho.md`](rules/06-fluxo-de-trabalho.md).

---

## Estado Atual

> Seção de leitura rápida. A IA lê SÓ isto no início da sessão.
> O histórico completo está abaixo para consulta quando necessário.

- **Stack**: Node + Express + TypeScript + TypeORM + PostgreSQL (Docker)
- **Auth**: JWT (access 15min / refresh 7d), bcrypt, 3 roles (Organizador, Cliente, Portaria)
- **Módulos implementados**: auth, events (CRUD + importação Ticketmaster), orders (reserva + pagamento), tickets (QR HMAC-SHA256, compartilhamento), gate (validação)
- **Seed**: 4 usuários e 30 eventos reais da Ticketmaster (~6.200 ingressos), rodando automaticamente a cada subida do contêiner. Funciona sem TM_API_KEY.
- **Política de acesso**: fail-closed, toda rota declara quem pode chamá-la, `route-policy.test.ts` cobra.
- **Decisão ativa**: capacidade = cache, verdade = COUNT. Reserva atômica com `SELECT FOR UPDATE`.
- **Verificação**: `npm run verify` passando (lint + tipos + testes).

---

## 2026-08-14 — Catálogo real na seed e seed automática no Docker

Substituição das 3 fixtures escritas à mão por 30 eventos reais capturados da
Discovery API, com a seed passando a rodar sozinha a cada subida do contêiner.

### Feito

- `npm run seed:capture` — script novo que busca eventos reais e regrava a
  fixture. Roda à mão, nunca no boot.
- Fixture com 30 eventos brasileiros reais (124KB), substituindo as 3 antigas.
- `npm run start:docker` (migrations → seed → API) como `command` do compose.
- Configuração de venda derivada do evento, no lugar da tabela por id.
- Normalização da grafia de cidade no mapeador.
- Testes do mapeador desacoplados da fixture.

### Decisões

**Captura em dois passos, e não busca direta.** O endpoint de busca devolve o
`venue` resumido — sem cidade nem endereço. Numa amostra de 100 eventos, só 5
traziam cidade; o filtro de local da home ficaria praticamente vazio. O detalhe
(`/events/{id}`) traz o registro completo, então a captura busca a lista e
depois o detalhe de cada selecionado. São ~31 chamadas contra uma cota de
5.000/dia.

**Fixture versionada, não chamada ao vivo no boot.** Subir o projeto não pode
depender de rede, de `TM_API_KEY` nem da cota da Ticketmaster, e dois
`docker compose up` precisam produzir o mesmo banco. A captura fica separada,
sob demanda.

**Resposta crua e podada, não já normalizada.** A fixture guarda o formato da
API para continuar passando pelo `mapEvent` da importação real — o caminho de
importação segue exercitado a cada seed. A poda remove só o que os nossos tipos
não declaram (`_links`, `sales`, `locale`) e limita a 3 imagens por evento: sem
isso o arquivo tinha 361KB de ruído e nem compilava, porque TypeScript recusa
propriedade desconhecida em literal.

**Configuração de venda derivada, não tabelada.** A tabela por `tm_event_id`
não sobrevive a uma recaptura: os ids mudam e ela passaria a apontar para
eventos inexistentes, deixando tudo em rascunho sem aviso. A derivação usa um
hash FNV-1a estável do id — determinística, então a mesma fixture gera sempre o
mesmo banco. `Math.random()` faria dois `up` divergirem.

**Grafia de cidade uniformizada no mapeador.** A API devolveu "Rio De Janeiro"
e "Rio de Janeiro" no mesmo lote. Como `listLocations` agrupa por `venue.city`,
a mesma cidade virava duas opções no filtro, cada uma com parte dos eventos.
Corrigido na fronteira com a API, valendo também para a importação que o
organizador dispara — não só para a seed.

**Testes do mapeador com fixtures próprias.** Antes liam
`TICKETMASTER_FIXTURES` e afirmavam sobre "Gala na Ópera". Como o arquivo agora
é gerado, cada recaptura quebraria a suíte — falha sem defeito, que ensina a
equipe a ignorar o vermelho. As fixtures de unidade passaram a ser declaradas
no próprio teste.

### Ficou de fora

- Só `countryCode=BR`. O catálogo brasileiro tem 181 eventos e nenhum traz
  `priceRanges`, então o preço de venda é derivado do segmento.
- A seed não recria eventos apagados à mão depois de já terem sido importados:
  a idempotência é por `tm_event_id`, e um evento removido volta a ser criado
  na execução seguinte. É o comportamento desejado aqui.

### Verificação

`npm run verify` — lint, tipos e 153 testes passando (eram 146; +7 do
mapeador). Boot completo validado com `docker compose down -v` seguido de `up`:
migrations aplicadas, 30 eventos e 6.186 ingressos criados, `/api/health` OK.

---

## 2026-08-13 — Importação Ticketmaster, autenticação JWT e CRUDs

Branch `feature/importacao-jwt-cruds`. A API saiu de "só health check" para o
fluxo inteiro funcionando: buscar evento, reservar, pagar (com recusa),
receber ingresso com QR, compartilhar e validar na portaria.

### Feito

- **Autenticação JWT** — registro, login, refresh e logout. Access de 15min e
  refresh de 7 dias, com segredos distintos. bcrypt 12 rounds.
- **Política de acesso fail-closed** — `publicRoute()`, `optionalAuth()`,
  `authGuard` e `roleGuard(...)`. Toda rota declara quem pode chamá-la;
  `route-policy.test.ts` reprova qualquer uma sem política e guarda a matriz do
  `MER §5.2`.
- **Importação Ticketmaster** — cliente HTTP com limite de 5 req/s, tradução de
  falha externa para o domínio, mapeador puro e `findOrCreate` de venue,
  atração e classificação.
- **Seed offline e idempotente** — 4 usuários, 3 eventos (2 publicados, 1
  rascunho), 234 ingressos. Roda sem `TM_API_KEY` usando fixtures no formato
  real da API, pelo mesmo mapeador da importação real.
- **CRUDs completos** — eventos (criar, importar, atualizar, publicar,
  cancelar, excluir, mapa de assentos), pedidos (reservar, pagar, cancelar),
  ingressos (listar, QR, compartilhar, resgatar), portaria (validar,
  histórico), usuários (perfil).
- **31 endpoints**, todos documentados no Swagger com sucesso e erro.
- 137 testes (eram 45).

### Decisões

**Política de acesso obrigatória, não opcional.** A alternativa comum —
"adicione o `authGuard` onde precisar" — falha do pior jeito possível:
esquecer o guard produz um endpoint aberto que passa em todos os testes. Com
política obrigatória, esquecer vira falha de build. Rota pública precisa
declarar que é pública.

**`roleGuard` autentica por dentro.** Exigir `authGuard` antes criaria duas
formas de errar: registrar só o segundo (rejeita todo mundo) ou só o primeiro
(não checa papel). Uma declaração por rota, sem ordem para acertar.

**Auditoria de rotas a partir de um registro, não da stack do Express.**
Primeira implementação lia `layer.regexp` para reconstruir o caminho de
montagem. Funciona no Express 4; a versão 5 substituiu por `matchers` e não
guarda mais o texto — a auditoria voltava `/shares/:token` em vez de
`/api/tickets/shares/:token`. Depender de interno de framework para uma
verificação de segurança é frágil demais. `src/api-routes.ts` virou a fonte de
verdade, usada tanto pela montagem quanto pela auditoria.

**Seed com fixtures, não com a API real.** Seed que depende de rede não é
reproduzível, e o desafio exige que o avaliador rode o fluxo sem montar nada.
As fixtures estão no formato real da Discovery API e passam pelo mesmo
mapeador — a importação fica exercitada a cada `npm run seed`.

**Seed que retoma, não que apenas pula.** Idempotência não é "não fazer nada na
segunda vez", é chegar ao mesmo estado final. Um evento importado numa execução
que falhou depois fica em rascunho, e um `continue` o deixaria quebrado para
sempre. Isso aconteceu de verdade aqui.

**Recusa de pagamento devolvida como valor, não lançada.** Lançar `AppError` de
dentro da transação fazia rollback exatamente do que precisava sobreviver: o
pedido marcado como `failed` e os ingressos devolvidos ao pool.

**Leitura do pedido só após o commit.** `findByIdOrFail` usava o repositório
comum dentro da transação — outra conexão, que não enxerga o dado ainda não
commitado. O pedido recém-criado voltava como "não encontrado".

**Endpoint `GET /events/:id/seats`.** Não estava previsto no `ARCHITECTURE.md`,
mas sem ele o front não tem como desenhar a seleção de assentos. Devolve id,
posição e disponibilidade — nunca `code` nem `qr_hash`: expor o código de um
ingresso à venda permitiria tentar entrar com um assento que ninguém comprou.

**Cookie de refresh com `SameSite=Lax`** (inconsistência #4, agora decidida).
`Strict` funciona em desenvolvimento por acidente — `localhost:5173` e
`localhost:3001` são o mesmo site. Em produção, com domínios diferentes,
bloquearia o cookie e o refresh nunca funcionaria.

### Inconsistência #6 do MER — corrigida, era grave

`order_items.ticket_id UNIQUE` **impedia a recompra de um assento devolvido ao
pool**. Eu havia registrado como aceitável na entrega anterior; rodar o fluxo
inteiro contra o banco mostrou que ela quebra justamente o caminho que o
desafio exige — "pagamento simulado, contemplando a confirmação e também a
recusa". Recusa → ingressos voltam ao pool → próxima compra estourava
`duplicate key value violates unique constraint`.

Corrigido na migration `ReleasableOrderItems1754100000000`: o item ganhou
`released_at` e a restrição virou parcial —
`UNIQUE (ticket_id) WHERE released_at IS NULL`. A garantia contra sobrevenda
continua intacta (dois pedidos *ativos* nunca apontam para o mesmo ingresso) e o
histórico do pedido recusado permanece. A migration inclui backfill para itens
de pedidos já em estado terminal.

### Três bugs que só apareceram rodando contra o Postgres

Nenhum deles seria pego por teste com dublê:

1. **`FOR UPDATE` com `LEFT JOIN`** — a validação da portaria travava a linha
   junto com os JOINs de `event` e `owner`. O Postgres recusa
   (`0A000`: *FOR UPDATE cannot be applied to the nullable side of an outer
   join*). O lock passou a vir numa query sem JOIN, com as relações carregadas
   em seguida, já com a linha travada.
2. **Ordem invertida na seed** — o `seatType` era ajustado *depois* do update
   que usa `event.seatType` para decidir de onde vem a capacidade. O evento
   chegava à publicação sem mapa de assentos.
3. **Hot reload silencioso no Windows** — bind mount de host Windows não
   propaga eventos inotify para o contêiner Linux. Alterações "não faziam
   efeito" sem nenhum aviso. Resolvido com `CHOKIDAR_USEPOLLING` no compose.

### Fora de escopo nesta entrega

- **Reserva com expiração.** Hoje a recusa devolve o assento na hora. O
  comportamento de mercado é segurar por alguns minutos, mas isso exige job de
  expiração — sem ele, pedidos abandonados prenderiam assentos para sempre.
- **Teste de concorrência real** — dois pedidos simultâneos no último assento.
  A garantia está no `UPDATE` condicional e foi verificada manualmente; o teste
  automatizado precisa de banco real.
- **Integração com a Ticketmaster de verdade** — sem `TM_API_KEY`. O cliente
  está pronto e o mapeador é testado com fixtures.

### Verificação

```
npm run verify                        → lint ✓  tipos ✓  137 testes ✓
docker compose down -v && up -d       → postgres healthy, api healthy
migration:run                         → InitialSchema + ReleasableOrderItems ✓
npm run seed                          → 4 usuários, 3 eventos, 234 ingressos
```

Fluxo completo pela API, do zero:

```
login cliente                → 200, papel client
GET /events (sem token)      → 2 publicados; o rascunho não aparece
GET /events/:id/seats        → 84 assentos, sem code/qrHash na resposta
POST /orders (2 assentos)    → pending, R$ 180,00, capacidade 84 → 82
POST /orders (mesmos, outro) → 409 "Este assento já está reservado"
POST /pay cartão final 0000  → 422 "Cartão recusado"; pedido failed; pool 84
POST /orders (mesmos again)  → pending  ← era o bug do UNIQUE
POST /pay cartão válido      → paid, ingressos sold, paymentId sim_...
GET /tickets/my → /:id       → código VP-NTDEF-YKW6, QR data URI 3706 bytes
POST /:id/share              → link com token de 32 bytes
GET /shares/:token (público) → evento e assento, sem código
POST /claim/:token (cliente2)→ posse transferida
POST /claim/:token de novo   → 409 "já foi resgatado"
gate: QR válido              → valid
gate: mesmo QR               → already_used
gate: código inexistente     → invalid
gate: assinatura forjada     → invalid
gate: outro evento           → wrong_event
gate: digitação manual       → valid
GET /gate/.../history        → 3 tentativas registradas, inclusive as recusadas
```

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
