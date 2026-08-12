# 03 — Banco de dados

Modelo completo em [`MER.md`](../MER.md). Esta regra trata de **como mexer** nele.

## Migrations, nunca `synchronize`

`synchronize` é `false` em todos os ambientes, inclusive desenvolvimento.
Schema criado por inferência esconde o que mudou, não sobrevive à primeira
divergência entre duas máquinas e não tem como voltar atrás.

```bash
npm run migration:run     # aplica pendentes
npm run migration:show    # o que já rodou
npm run migration:revert  # desfaz a última
```

**Toda migration tem `down` funcional.** Migration que não desfaz é migration
que ninguém tem coragem de rodar em produção.

Prefira SQL explícito a `migration:generate`. O gerador não produz índice
parcial nem `CHECK`, e o SQL escrito à mão é legível em revisão — a migration
é o contrato do banco.

## A integridade é do banco

A aplicação valida para dar boa mensagem ao usuário. O banco garante.

| Garantia | Onde vive |
| --- | --- |
| Mesmo assento não vendido duas vezes | Índice parcial `uq_tickets_seat` |
| Ingresso em um pedido só | `UNIQUE (ticket_id)` em `order_items` |
| Capacidade nunca negativa | `CHECK (available_capacity >= 0)` |
| Disponível nunca maior que o total | `CHECK (available_capacity <= total_capacity)` |
| Evento sempre com local e organizador | `NOT NULL` + FK `ON DELETE RESTRICT` |

O índice de assento é **parcial** (`WHERE status <> 'canceled' AND seat_number
IS NOT NULL`) por dois motivos: assento cancelado deve poder voltar à venda, e
evento de pista não tem número de assento.

## Reserva: a transação que impede sobrevenda

O `MER §7.1` descreve `INSERT INTO tickets`, mas o `§6.2` diz que o pool de
ingressos já foi criado ao publicar o evento. **O código segue o §6.2**: a
reserva atualiza linhas existentes.

```
BEGIN                                        -- READ COMMITTED basta
  UPDATE events
     SET available_capacity = available_capacity - :qty
   WHERE id = :eventId AND available_capacity >= :qty
  -- 0 linhas afetadas → esgotado → ROLLBACK → 409

  UPDATE tickets SET status = 'reserved', owner_id = :userId
   WHERE id = ANY(:ticketIds) AND status = 'available'
  -- menos linhas que o pedido → alguém chegou antes → ROLLBACK → 409

  INSERT INTO orders (status = 'pending')
  INSERT INTO order_items
COMMIT
```

O `UPDATE` condicional é o coração: `WHERE available_capacity >= :qty` é
avaliado sob lock de linha pelo próprio Postgres. Dois pedidos simultâneos
serializam ali, e o segundo enxerga o valor já decrementado.

**Não use `SERIALIZABLE`.** O `MER §7.1` sugeria `SERIALIZABLE` junto com
`SELECT ... FOR UPDATE` — é redundante: o `UPDATE` condicional já toma o lock
que resolve o problema, e o nível `SERIALIZABLE` só acrescenta erros de
serialização que exigiriam lógica de retry sem ganho nenhum aqui.

## `available_capacity` é cache, não verdade

A fonte de verdade da disponibilidade é a tabela `tickets`. O contador em
`events` existe para a listagem não precisar de um `COUNT` por evento.

Regra: **o contador só muda dentro da mesma transação que muda o status dos
tickets.** Alterar um sem o outro cria divergência silenciosa — o evento aparece
esgotado com ingressos livres, ou o contrário.

## Dinheiro é `decimal`, e chega como string

Colunas monetárias são `numeric(10,2)` e o driver do Postgres as entrega como
`string`. **Isso é proposital.** Converter para `number` introduz erro de ponto
flutuante: `0.1 + 0.2 !== 0.3`. Faça a aritmética com inteiros de centavos ou
biblioteca decimal, e formate só na apresentação.

## Ao criar uma entidade

1. Coluna com `name` explícito em `snake_case` — o banco é snake, o TypeScript
   é camel, e a tradução fica num lugar só.
2. Estenda `BaseEntity` (id + `created_at`) ou `AuditedEntity` (com
   `updated_at`).
3. Declare a FK **e** a coluna de id (`event` e `eventId`): sem a coluna, toda
   query por id precisa de JOIN.
4. Registre em `src/database/entities.ts`.
5. Escreva a migration à mão, com `down`.
6. Rode `npm test` — `entities.test.ts` verifica o registro.
