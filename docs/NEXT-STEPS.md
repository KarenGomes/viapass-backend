# Próximos passos

Fila de trabalho. Cada item deve ser específico o bastante para alguém que
nunca viu o projeto começar sem perguntar nada.

---

## Concluído — 2026-08-14 (catálogo real e seed automática)

- [x] `npm run seed:capture` para capturar eventos reais da Discovery API
- [x] Fixture com 30 eventos brasileiros reais, substituindo as 3 escritas à mão
- [x] Detalhe buscado por evento, para trazer cidade e endereço completos
- [x] Poda da resposta para o shape declarado em `TMEvent` (361KB → 124KB)
- [x] Seed rodando sozinha no boot do contêiner (`npm run start:docker`)
- [x] Configuração de venda derivada por hash estável, no lugar da tabela por id
- [x] Grafia de cidade uniformizada no mapeador (evita cidade duplicada no filtro)
- [x] Testes do mapeador desacoplados da fixture gerada

### Surgiu

- [ ] Preço de venda vem do segmento, não da Ticketmaster: nenhum evento do
      catálogo BR traz `priceRanges`. Se a cobertura melhorar, `priceFor` já
      prefere o valor informado — só falta reavaliar a faixa derivada.
- [ ] A captura lê só a primeira página (100 de 181 eventos BR). Paginar
      ampliaria a variedade de cidades e segmentos.
- [ ] `docker compose down -v` apaga o volume e, com ele, dados criados à mão
      na aplicação. Vale documentar no README que a seed repõe só o catálogo,
      não o que foi criado pela interface.

---

## Concluído — 2026-08-13 (`feature/importacao-jwt-cruds`)

- [x] Autenticação JWT com access + refresh e segredos distintos
- [x] `authGuard`, `roleGuard`, `publicRoute`, `optionalAuth` — política fail-closed
- [x] Teste que reprova rota sem política e guarda a matriz do MER §5.2
- [x] `validateBody` com class-validator, respondendo no formato `{ msg }`
- [x] Cliente da Ticketmaster com limite de 5 req/s e tradução de erro
- [x] Mapeador da Discovery API, testado com fixtures
- [x] `findOrCreate` de venue, atração e classificação
- [x] Importação de evento como rascunho
- [x] Seed offline, idempotente e capaz de retomar estado incompleto
- [x] CRUD de eventos + publicação com geração do pool de ingressos
- [x] `GET /events/:id/seats` para o mapa de assentos
- [x] Checkout com reserva transacional anti-sobrevenda
- [x] Pagamento simulado com confirmação **e** recusa
- [x] Cancelamento com devolução ao estoque
- [x] Ingressos com QR assinado por HMAC
- [x] Compartilhamento por link com resgate único
- [x] Portaria com os quatro retornos e auditoria de toda tentativa
- [x] Corrigida a inconsistência #6 (UNIQUE impedia recompra após recusa)

## Concluído — 2026-08-12

- [x] Node + Express + TypeORM + TypeScript estrito
- [x] Validação de ambiente no boot
- [x] 12 entidades + migration inicial com CHECKs e índice parcial
- [x] `AppError` + `StatusErrors` + `ResponseErrors` + tratador global
- [x] Swagger com respostas reutilizáveis
- [x] `GET /api/health` validando a conexão real
- [x] Docker Compose com healthcheck
- [x] `CLAUDE.md` e rules

---

## 1 — Lacunas do que já foi entregue

- [ ] **Teste de concorrência real**: dois `POST /orders` simultâneos no último
      assento — só um pode passar. Precisa de banco de verdade (Testcontainers)
- [ ] Testes unitários de `OrderService` e `EventService` — hoje só a lógica de
      pagamento, portaria, auth e mapeamento tem cobertura
- [ ] **Reserva com expiração**: hoje a recusa devolve o assento na hora. O
      comportamento de mercado é segurar por ~10min, o que exige um job que
      libere pedidos `pending` vencidos
- [ ] Exercitar a importação contra a API real da Ticketmaster (precisa de
      `TM_API_KEY`)
- [ ] Busca com acento-insensível — hoje `ILIKE` só ignora maiúsculas.
      Requer a extensão `unaccent` do Postgres
- [ ] Rate limit da Ticketmaster é por instância (memória). Com mais de uma
      réplica, o limite de 5 req/s é furado — precisaria de contador
      compartilhado

## 2 — Segurança e operação

- [ ] Revogação de refresh token (hoje um refresh vazado vale 7 dias)
- [ ] Criar organizador e portaria deveria ser ação administrativa — hoje
      `POST /auth/register` aceita o papel para facilitar a avaliação
- [ ] Logger estruturado no lugar de `console.log`
- [ ] Métricas e tracing

## 3 — Entrega

- [ ] `README` da raiz cobrindo front + back
- [ ] Compose único na raiz subindo front, back e banco
- [ ] Deploy (vale 1 ponto na nota do desafio)
- [ ] `docs/USO-DE-IA.md`, como já existe no front-end

## 4 — Front-end

O back-end está pronto para ser consumido. O contrato está em `/docs.json`.

- [ ] Cliente HTTP com o access token e renovação automática no 401
- [ ] Telas: home, detalhe do evento, mapa de assentos, checkout, meus
      ingressos, portaria, painel do organizador

---

## Riscos e dúvidas em aberto

| # | Assunto | Situação |
| --- | --- | --- |
| 1 | **Assento devolvido na hora após recusa** — o cliente pode perder o lugar enquanto pega outro cartão | Alternativa (segurar por N minutos) exige job de expiração; decidir se entra no escopo |
| 2 | **Papel no registro público** — qualquer um pode criar conta de organizador ou portaria | Intencional para a avaliação; precisa mudar antes de qualquer uso real |
| 3 | **`event_status_enum` tem `published` e `onsale`** | Hoje `publish` vai direto para `onsale`; `published` está sem uso real. Fundir ou dar significado |
| 4 | **Sem `TM_API_KEY`** | O cliente está implementado e o mapeador testado, mas a chamada real nunca rodou |
| 5 | **Hot reload no Windows** | Resolvido com polling no compose; em máquina lenta pode custar CPU |
| 6 | **Refresh sem revogação** | Logout limpa o cookie, mas o token continua válido até expirar |
| 7 | **Volume do Postgres persiste no `down`** | Use `docker compose down -v` ao trocar credenciais no `.env` |
