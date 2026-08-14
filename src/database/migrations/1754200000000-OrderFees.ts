import type { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Taxa de serviço e proteção opcional no pedido.
 *
 * O `total_amount` guardava só a soma dos ingressos. O checkout desenhado
 * mostra três linhas distintas — ingressos, taxa de serviço e proteção — e o
 * cliente precisa conseguir conferir cada uma.
 *
 * Guardamos as parcelas em colunas próprias, e não só o total, por dois
 * motivos: recalcular a decomposição a partir do total é impossível quando a
 * regra da taxa mudar, e um pedido antigo precisa continuar mostrando o que
 * foi cobrado **naquele dia**.
 */
export class OrderFees1754200000000 implements MigrationInterface {
  name = 'OrderFees1754200000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders"
        ADD COLUMN "subtotal_amount"   numeric(10,2) NOT NULL DEFAULT 0,
        ADD COLUMN "service_fee"       numeric(10,2) NOT NULL DEFAULT 0,
        ADD COLUMN "protection_fee"    numeric(10,2) NOT NULL DEFAULT 0,
        ADD COLUMN "has_protection"    boolean       NOT NULL DEFAULT false
    `)

    // Pedidos anteriores não tinham taxa: o total era só a soma dos ingressos.
    await queryRunner.query(`UPDATE "orders" SET "subtotal_amount" = "total_amount"`)

    await queryRunner.query(`
      ALTER TABLE "orders"
        ADD CONSTRAINT "chk_orders_amounts_non_negative"
        CHECK (
          "subtotal_amount" >= 0 AND "service_fee" >= 0 AND
          "protection_fee" >= 0 AND "total_amount" >= 0
        )
    `)

    /**
     * O total tem que ser exatamente a soma das partes. Sem esta constraint,
     * um bug de arredondamento produziria um pedido cujo total não bate com o
     * que o cliente viu na tela — e ninguém perceberia até a reclamação.
     */
    await queryRunner.query(`
      ALTER TABLE "orders"
        ADD CONSTRAINT "chk_orders_total_matches_parts"
        CHECK ("total_amount" = "subtotal_amount" + "service_fee" + "protection_fee")
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "chk_orders_total_matches_parts"`,
    )
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "chk_orders_amounts_non_negative"`,
    )
    await queryRunner.query(`
      ALTER TABLE "orders"
        DROP COLUMN "has_protection",
        DROP COLUMN "protection_fee",
        DROP COLUMN "service_fee",
        DROP COLUMN "subtotal_amount"
    `)
  }
}
