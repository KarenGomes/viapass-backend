import type { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Schema inicial do ViaPass — implementa o MER (docs/MER.md) por completo.
 *
 * Escrito em SQL explícito, e não gerado por `migration:generate`, porque a
 * migration é o contrato do banco: precisa ser legível em revisão e conter os
 * índices parciais e CHECKs que o gerador não produz sozinho.
 */
export class InitialSchema1754000000000 implements MigrationInterface {
  name = 'InitialSchema1754000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // uuid_generate_v4() é o gerador que o TypeORM usa em @PrimaryGeneratedColumn('uuid').
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)

    // ── Tipos ENUM ───────────────────────────────────────────────────────
    await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM ('organizer', 'client', 'gate')`)
    await queryRunner.query(
      `CREATE TYPE "event_status_enum" AS ENUM ('draft', 'published', 'onsale', 'offsale', 'canceled', 'completed')`,
    )
    await queryRunner.query(
      `CREATE TYPE "seat_type_enum" AS ENUM ('mapped', 'general_admission')`,
    )
    await queryRunner.query(
      `CREATE TYPE "order_status_enum" AS ENUM ('pending', 'processing', 'paid', 'failed', 'refunded', 'canceled')`,
    )
    await queryRunner.query(
      `CREATE TYPE "ticket_status_enum" AS ENUM ('available', 'reserved', 'sold', 'used', 'canceled')`,
    )
    await queryRunner.query(
      `CREATE TYPE "validation_result_enum" AS ENUM ('valid', 'invalid', 'already_used', 'wrong_event')`,
    )

    // ── users ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"            uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"    timestamptz   NOT NULL DEFAULT now(),
        "updated_at"    timestamptz   NOT NULL DEFAULT now(),
        "name"          varchar(255)  NOT NULL,
        "email"         varchar(255)  NOT NULL,
        "password_hash" varchar(255)  NOT NULL,
        "role"          "user_role_enum" NOT NULL DEFAULT 'client',
        "is_active"     boolean       NOT NULL DEFAULT true,
        CONSTRAINT "pk_users" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_users_email" ON "users" ("email")`)
    await queryRunner.query(`CREATE INDEX "idx_users_role" ON "users" ("role")`)

    // ── venues ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "venues" (
        "id"            uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"    timestamptz   NOT NULL DEFAULT now(),
        "tm_venue_id"   varchar(64),
        "name"          varchar(255)  NOT NULL,
        "address_line1" varchar(255),
        "city"          varchar(128),
        "state_code"    varchar(16),
        "country_code"  varchar(8),
        "postal_code"   varchar(32),
        "timezone"      varchar(64),
        "latitude"      numeric(10,8),
        "longitude"     numeric(11,8),
        CONSTRAINT "pk_venues" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_venues_tm_id" ON "venues" ("tm_venue_id")`)

    // ── attractions ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "attractions" (
        "id"               uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"       timestamptz  NOT NULL DEFAULT now(),
        "tm_attraction_id" varchar(64),
        "name"             varchar(255) NOT NULL,
        "url"              varchar(512),
        "image_url"        varchar(512),
        "segment"          varchar(128),
        "genre"            varchar(128),
        CONSTRAINT "pk_attractions" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_attractions_tm_id" ON "attractions" ("tm_attraction_id")`,
    )

    // ── classifications ──────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "classifications" (
        "id"             uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"     timestamptz  NOT NULL DEFAULT now(),
        "tm_segment_id"  varchar(64),
        "segment_name"   varchar(128) NOT NULL,
        "tm_genre_id"    varchar(64),
        "genre_name"     varchar(128),
        "tm_subgenre_id" varchar(64),
        "subgenre_name"  varchar(128),
        CONSTRAINT "pk_classifications" PRIMARY KEY ("id")
      )
    `)

    // ── events ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "events" (
        "id"                 uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"         timestamptz  NOT NULL DEFAULT now(),
        "updated_at"         timestamptz  NOT NULL DEFAULT now(),
        "tm_event_id"        varchar(64),
        "name"               varchar(255) NOT NULL,
        "description"        text,
        "venue_id"           uuid         NOT NULL,
        "organizer_id"       uuid         NOT NULL,
        "classification_id"  uuid,
        "event_date"         date         NOT NULL,
        "event_time"         time,
        "event_datetime"     timestamptz,
        "status"             "event_status_enum" NOT NULL DEFAULT 'draft',
        "total_capacity"     integer      NOT NULL,
        "available_capacity" integer      NOT NULL,
        "seat_type"          "seat_type_enum" NOT NULL,
        "seat_map_config"    jsonb,
        "seatmap_url"        varchar(512),
        "sale_start"         timestamptz,
        "sale_end"           timestamptz,
        CONSTRAINT "pk_events" PRIMARY KEY ("id"),
        CONSTRAINT "chk_events_total_capacity"     CHECK ("total_capacity" > 0),
        CONSTRAINT "chk_events_available_capacity" CHECK ("available_capacity" >= 0),
        CONSTRAINT "chk_events_capacity_bounds"    CHECK ("available_capacity" <= "total_capacity")
      )
    `)
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_events_tm_id" ON "events" ("tm_event_id")`)
    await queryRunner.query(`CREATE INDEX "idx_events_status" ON "events" ("status")`)
    await queryRunner.query(`CREATE INDEX "idx_events_organizer" ON "events" ("organizer_id")`)
    await queryRunner.query(`CREATE INDEX "idx_events_date" ON "events" ("event_date")`)

    // ── event_attractions (junção N:N) ───────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "event_attractions" (
        "event_id"      uuid NOT NULL,
        "attraction_id" uuid NOT NULL,
        CONSTRAINT "pk_event_attractions" PRIMARY KEY ("event_id", "attraction_id")
      )
    `)
    await queryRunner.query(
      `CREATE INDEX "idx_event_attractions_attraction" ON "event_attractions" ("attraction_id")`,
    )

    // ── event_images ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "event_images" (
        "id"          uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"  timestamptz  NOT NULL DEFAULT now(),
        "event_id"    uuid         NOT NULL,
        "url"         varchar(512) NOT NULL,
        "ratio"       varchar(16),
        "width"       integer,
        "height"      integer,
        "is_fallback" boolean      NOT NULL DEFAULT false,
        CONSTRAINT "pk_event_images" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(`CREATE INDEX "idx_event_images_event" ON "event_images" ("event_id")`)

    // ── price_ranges ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "price_ranges" (
        "id"         uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" timestamptz   NOT NULL DEFAULT now(),
        "event_id"   uuid          NOT NULL,
        "type"       varchar(64),
        "currency"   varchar(8)    NOT NULL DEFAULT 'BRL',
        "min_price"  numeric(10,2) NOT NULL,
        "max_price"  numeric(10,2) NOT NULL,
        CONSTRAINT "pk_price_ranges" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(`CREATE INDEX "idx_price_ranges_event" ON "price_ranges" ("event_id")`)

    // ── tickets ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "tickets" (
        "id"           uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"   timestamptz  NOT NULL DEFAULT now(),
        "event_id"     uuid         NOT NULL,
        "owner_id"     uuid,
        "code"         varchar(32)  NOT NULL,
        "qr_hash"      varchar(255) NOT NULL,
        "status"       "ticket_status_enum" NOT NULL DEFAULT 'available',
        "seat_label"   varchar(64),
        "seat_section" varchar(32),
        "seat_row"     varchar(16),
        "seat_number"  integer,
        CONSTRAINT "pk_tickets" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_tickets_code" ON "tickets" ("code")`)
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_tickets_qr_hash" ON "tickets" ("qr_hash")`)
    await queryRunner.query(`CREATE INDEX "idx_tickets_event" ON "tickets" ("event_id")`)
    await queryRunner.query(`CREATE INDEX "idx_tickets_owner" ON "tickets" ("owner_id")`)
    await queryRunner.query(`CREATE INDEX "idx_tickets_status" ON "tickets" ("status")`)

    // Índice parcial: garante um único ingresso vivo por lugar. Fica de fora
    // quem foi cancelado (o lugar volta a poder ser vendido) e os eventos de
    // pista, onde seat_number é nulo.
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_tickets_seat"
        ON "tickets" ("event_id", "seat_section", "seat_row", "seat_number")
        WHERE "status" <> 'canceled' AND "seat_number" IS NOT NULL
    `)

    // ── orders ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id"             uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"     timestamptz   NOT NULL DEFAULT now(),
        "updated_at"     timestamptz   NOT NULL DEFAULT now(),
        "user_id"        uuid          NOT NULL,
        "event_id"       uuid          NOT NULL,
        "status"         "order_status_enum" NOT NULL DEFAULT 'pending',
        "total_amount"   numeric(10,2) NOT NULL,
        "currency"       varchar(8)    NOT NULL DEFAULT 'BRL',
        "payment_method" varchar(64),
        "payment_id"     varchar(255),
        "paid_at"        timestamptz,
        CONSTRAINT "pk_orders" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(`CREATE INDEX "idx_orders_user" ON "orders" ("user_id")`)
    await queryRunner.query(`CREATE INDEX "idx_orders_event" ON "orders" ("event_id")`)
    await queryRunner.query(`CREATE INDEX "idx_orders_status" ON "orders" ("status")`)

    // ── order_items ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id"         uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" timestamptz   NOT NULL DEFAULT now(),
        "order_id"   uuid          NOT NULL,
        "ticket_id"  uuid          NOT NULL,
        "unit_price" numeric(10,2) NOT NULL,
        "seat_label" varchar(64),
        CONSTRAINT "pk_order_items" PRIMARY KEY ("id"),
        CONSTRAINT "uq_order_items_ticket" UNIQUE ("ticket_id")
      )
    `)
    await queryRunner.query(`CREATE INDEX "idx_order_items_order" ON "order_items" ("order_id")`)

    // ── ticket_validations ───────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "ticket_validations" (
        "id"           uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "ticket_id"    uuid        NOT NULL,
        "validated_by" uuid        NOT NULL,
        "result"       "validation_result_enum" NOT NULL,
        "validated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_ticket_validations" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(
      `CREATE INDEX "idx_ticket_validations_ticket" ON "ticket_validations" ("ticket_id")`,
    )

    // ── ticket_shares ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "ticket_shares" (
        "id"          uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"  timestamptz  NOT NULL DEFAULT now(),
        "ticket_id"   uuid         NOT NULL,
        "share_token" varchar(128) NOT NULL,
        "expires_at"  timestamptz  NOT NULL,
        "is_claimed"  boolean      NOT NULL DEFAULT false,
        "claimed_by"  uuid,
        CONSTRAINT "pk_ticket_shares" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_ticket_shares_token" ON "ticket_shares" ("share_token")`,
    )
    await queryRunner.query(
      `CREATE INDEX "idx_ticket_shares_ticket" ON "ticket_shares" ("ticket_id")`,
    )

    // ── Chaves estrangeiras ──────────────────────────────────────────────
    // RESTRICT onde apagar destruiria histórico financeiro ou de auditoria.
    // CASCADE apenas em filhos que não fazem sentido sozinhos.
    await queryRunner.query(`
      ALTER TABLE "events"
        ADD CONSTRAINT "fk_events_venue"          FOREIGN KEY ("venue_id")          REFERENCES "venues"("id")          ON DELETE RESTRICT,
        ADD CONSTRAINT "fk_events_organizer"      FOREIGN KEY ("organizer_id")      REFERENCES "users"("id")           ON DELETE RESTRICT,
        ADD CONSTRAINT "fk_events_classification" FOREIGN KEY ("classification_id") REFERENCES "classifications"("id") ON DELETE SET NULL
    `)
    await queryRunner.query(`
      ALTER TABLE "event_attractions"
        ADD CONSTRAINT "fk_event_attractions_event"      FOREIGN KEY ("event_id")      REFERENCES "events"("id")      ON DELETE CASCADE,
        ADD CONSTRAINT "fk_event_attractions_attraction" FOREIGN KEY ("attraction_id") REFERENCES "attractions"("id") ON DELETE CASCADE
    `)
    await queryRunner.query(`
      ALTER TABLE "event_images"
        ADD CONSTRAINT "fk_event_images_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE
    `)
    await queryRunner.query(`
      ALTER TABLE "price_ranges"
        ADD CONSTRAINT "fk_price_ranges_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE
    `)
    await queryRunner.query(`
      ALTER TABLE "tickets"
        ADD CONSTRAINT "fk_tickets_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        ADD CONSTRAINT "fk_tickets_owner" FOREIGN KEY ("owner_id") REFERENCES "users"("id")  ON DELETE SET NULL
    `)
    await queryRunner.query(`
      ALTER TABLE "orders"
        ADD CONSTRAINT "fk_orders_user"  FOREIGN KEY ("user_id")  REFERENCES "users"("id")  ON DELETE RESTRICT,
        ADD CONSTRAINT "fk_orders_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT
    `)
    await queryRunner.query(`
      ALTER TABLE "order_items"
        ADD CONSTRAINT "fk_order_items_order"  FOREIGN KEY ("order_id")  REFERENCES "orders"("id")  ON DELETE CASCADE,
        ADD CONSTRAINT "fk_order_items_ticket" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT
    `)
    await queryRunner.query(`
      ALTER TABLE "ticket_validations"
        ADD CONSTRAINT "fk_ticket_validations_ticket" FOREIGN KEY ("ticket_id")    REFERENCES "tickets"("id") ON DELETE CASCADE,
        ADD CONSTRAINT "fk_ticket_validations_user"   FOREIGN KEY ("validated_by") REFERENCES "users"("id")   ON DELETE RESTRICT
    `)
    await queryRunner.query(`
      ALTER TABLE "ticket_shares"
        ADD CONSTRAINT "fk_ticket_shares_ticket"  FOREIGN KEY ("ticket_id")  REFERENCES "tickets"("id") ON DELETE CASCADE,
        ADD CONSTRAINT "fk_ticket_shares_claimer" FOREIGN KEY ("claimed_by") REFERENCES "users"("id")   ON DELETE SET NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Ordem inversa da criação: filhos antes dos pais.
    await queryRunner.query(`DROP TABLE IF EXISTS "ticket_shares"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "ticket_validations"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "order_items"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "orders"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "tickets"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "price_ranges"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "event_images"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "event_attractions"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "events"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "classifications"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "attractions"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "venues"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`)

    await queryRunner.query(`DROP TYPE IF EXISTS "validation_result_enum"`)
    await queryRunner.query(`DROP TYPE IF EXISTS "ticket_status_enum"`)
    await queryRunner.query(`DROP TYPE IF EXISTS "order_status_enum"`)
    await queryRunner.query(`DROP TYPE IF EXISTS "seat_type_enum"`)
    await queryRunner.query(`DROP TYPE IF EXISTS "event_status_enum"`)
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`)
  }
}
