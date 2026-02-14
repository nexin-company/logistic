import { pgTable, serial, text, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";

export const externalProductStatusEnum = pgEnum('external_product_status', ['active', 'inactive', 'archived']);

export const externalProducts = pgTable("external_products", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  status: externalProductStatusEnum("status").notNull().default("active"),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("MXN"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

