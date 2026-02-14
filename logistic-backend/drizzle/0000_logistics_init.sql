-- Logistics Backend initial migration
-- Combina migraciones de Inventory y Shipments

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'external_product_status') THEN
    CREATE TYPE "external_product_status" AS ENUM ('active', 'inactive', 'archived');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shipment_status') THEN
    CREATE TYPE "shipment_status" AS ENUM ('pending','packed','shipped','in_transit','delivered','exception','cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shipment_event_type') THEN
    CREATE TYPE "shipment_event_type" AS ENUM ('created','packed','picked_up','in_transit','out_for_delivery','delivered','exception');
  END IF;
END $$;

-- API keys (común a ambos módulos, solo una definición)
CREATE TABLE IF NOT EXISTS "api_keys" (
  "id" serial PRIMARY KEY NOT NULL,
  "key_hash" text NOT NULL,
  "name" text NOT NULL,
  "scopes" jsonb,
  "rate_limit" integer DEFAULT 100,
  "expires_at" timestamp,
  "created_by" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "last_used_at" timestamp,
  "is_active" text DEFAULT 'active',
  CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash")
);

-- External products (Catalog)
CREATE TABLE IF NOT EXISTS "external_products" (
  "id" serial PRIMARY KEY NOT NULL,
  "sku" text NOT NULL,
  "name" text NOT NULL,
  "status" "external_product_status" DEFAULT 'active' NOT NULL,
  "base_price" numeric(10, 2) NOT NULL,
  "currency" text DEFAULT 'MXN' NOT NULL,
  "image_url" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "external_products_sku_unique" UNIQUE("sku")
);

-- Warehouses
CREATE TABLE IF NOT EXISTS "warehouses" (
  "id" serial PRIMARY KEY NOT NULL,
  "code" text NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "warehouses_code_unique" UNIQUE("code")
);

-- Stock levels
CREATE TABLE IF NOT EXISTS "stock_levels" (
  "id" serial PRIMARY KEY NOT NULL,
  "warehouse_id" integer NOT NULL,
  "external_product_id" integer NOT NULL,
  "on_hand" integer DEFAULT 0 NOT NULL,
  "reserved" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'stock_levels_warehouse_id_warehouses_id_fk'
  ) THEN
    ALTER TABLE "stock_levels"
      ADD CONSTRAINT "stock_levels_warehouse_id_warehouses_id_fk"
      FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id")
      ON DELETE cascade;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'stock_levels_external_product_id_external_products_id_fk'
  ) THEN
    ALTER TABLE "stock_levels"
      ADD CONSTRAINT "stock_levels_external_product_id_external_products_id_fk"
      FOREIGN KEY ("external_product_id") REFERENCES "external_products"("id")
      ON DELETE cascade;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "uniq_stock_levels_wh_product" ON "stock_levels" ("warehouse_id", "external_product_id");

-- Mappings internal->external
CREATE TABLE IF NOT EXISTS "internal_to_external_mappings" (
  "id" serial PRIMARY KEY NOT NULL,
  "internal_item_id" integer NOT NULL,
  "external_product_id" integer NOT NULL,
  "note" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'internal_to_external_mappings_external_product_id_external_products_id_fk'
  ) THEN
    ALTER TABLE "internal_to_external_mappings"
      ADD CONSTRAINT "internal_to_external_mappings_external_product_id_external_products_id_fk"
      FOREIGN KEY ("external_product_id") REFERENCES "external_products"("id")
      ON DELETE cascade;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "uniq_mapping_internal_external" ON "internal_to_external_mappings" ("internal_item_id", "external_product_id");

-- Shipments
CREATE TABLE IF NOT EXISTS "shipments" (
  "id" serial PRIMARY KEY NOT NULL,
  "order_id" integer NOT NULL,
  "status" "shipment_status" DEFAULT 'pending' NOT NULL,
  "carrier" text,
  "tracking_number" text,
  "tracking_url" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_shipments_order_id" ON "shipments" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_shipments_status" ON "shipments" ("status");

-- Tracking events
CREATE TABLE IF NOT EXISTS "shipment_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "shipment_id" integer NOT NULL,
  "type" "shipment_event_type" NOT NULL,
  "location" text,
  "message" text,
  "occurred_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'shipment_events_shipment_id_shipments_id_fk'
  ) THEN
    ALTER TABLE "shipment_events"
      ADD CONSTRAINT "shipment_events_shipment_id_shipments_id_fk"
      FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id")
      ON DELETE cascade;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_shipment_events_shipment_id" ON "shipment_events" ("shipment_id");
CREATE INDEX IF NOT EXISTS "idx_shipment_events_occurred_at" ON "shipment_events" ("occurred_at");

-- Additional indexes for catalog
CREATE INDEX IF NOT EXISTS "idx_external_products_name" ON "external_products" ("name");
CREATE INDEX IF NOT EXISTS "idx_external_products_status" ON "external_products" ("status");
CREATE INDEX IF NOT EXISTS "idx_stock_levels_external_product_id" ON "stock_levels" ("external_product_id");
CREATE INDEX IF NOT EXISTS "idx_stock_levels_warehouse_id" ON "stock_levels" ("warehouse_id");

