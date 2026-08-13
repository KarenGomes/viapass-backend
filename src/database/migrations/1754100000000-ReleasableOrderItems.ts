import type { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Torna o vínculo item ↔ ingresso liberável.
 *
 * **O problema.** `order_items.ticket_id` era `UNIQUE` absoluto — a última
 * barreira contra vender o mesmo ingresso duas vezes. Só que ele também
 * impedia o caso legítimo: pagamento recusado devolve os ingressos ao pool, e
 * a próxima compra daquele assento estourava
 * `duplicate key value violates unique constraint "uq_order_items_ticket"`.
 *
 * Isso quebrava exatamente o fluxo que o desafio exige — "pagamento simulado,
 * contemplando a confirmação e também a recusa" — e só apareceu ao rodar o
 * fluxo inteiro contra o banco de verdade.
 *
 * **A correção.** O item ganha `released_at`, preenchido na mesma transação
 * que devolve o ingresso ao pool, e a restrição vira um índice **parcial**
 * sobre os itens ainda vivos:
 *
 *     UNIQUE (ticket_id) WHERE released_at IS NULL
 *
 * A garantia contra sobrevenda continua intacta — dois pedidos ativos jamais
 * apontam para o mesmo ingresso — e o histórico do pedido recusado permanece,
 * agora com a marca de quando o assento foi devolvido.
 */
export class ReleasableOrderItems1754100000000 implements MigrationInterface {
  name = 'ReleasableOrderItems1754100000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order_items" ADD COLUMN "released_at" timestamptz`)

    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "uq_order_items_ticket"`,
    )

    /**
     * Backfill: itens de pedidos em estado terminal já tiveram seus ingressos
     * devolvidos ao pool, mas nasceram sem `released_at`. Sem marcá-los, eles
     * continuariam segurando o assento no índice parcial e a recompra
     * quebraria — exatamente o defeito que esta migration existe para corrigir.
     */
    await queryRunner.query(`
      UPDATE "order_items" AS oi
         SET "released_at" = o."updated_at"
        FROM "orders" AS o
       WHERE o."id" = oi."order_id"
         AND o."status" IN ('failed', 'canceled', 'refunded')
    `)

    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_order_items_ticket_active"
        ON "order_items" ("ticket_id")
        WHERE "released_at" IS NULL
    `)

    await queryRunner.query(
      `CREATE INDEX "idx_order_items_ticket" ON "order_items" ("ticket_id")`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_order_items_ticket"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_order_items_ticket_active"`)

    // Só é possível voltar à restrição absoluta se não houver itens liberados
    // apontando para o mesmo ingresso — daí a limpeza antes.
    await queryRunner.query(`DELETE FROM "order_items" WHERE "released_at" IS NOT NULL`)
    await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "released_at"`)
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "uq_order_items_ticket" UNIQUE ("ticket_id")`,
    )
  }
}
