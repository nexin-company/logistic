import { pgTable, serial, integer, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { externalProducts } from "../catalog/schema";

export const internalToExternalMappings = pgTable(
  "internal_to_external_mappings",
  {
    id: serial("id").primaryKey(),
    internalItemId: integer("internal_item_id").notNull(),
    externalProductId: integer("external_product_id").notNull().references(() => externalProducts.id, { onDelete: 'cascade' }),
    note: text("note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    uniq: uniqueIndex('uniq_mapping_internal_external').on(t.internalItemId, t.externalProductId),
  })
);

