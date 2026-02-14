import { pgTable, serial, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { warehouses } from "../warehouses/schema";
import { externalProducts } from "../catalog/schema";

export const stockLevels = pgTable(
  "stock_levels",
  {
    id: serial("id").primaryKey(),
    warehouseId: integer("warehouse_id").notNull().references(() => warehouses.id, { onDelete: 'cascade' }),
    externalProductId: integer("external_product_id").notNull().references(() => externalProducts.id, { onDelete: 'cascade' }),
    onHand: integer("on_hand").notNull().default(0),
    reserved: integer("reserved").notNull().default(0),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    uniq: uniqueIndex('uniq_stock_levels_wh_product').on(t.warehouseId, t.externalProductId),
  })
);

