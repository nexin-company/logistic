import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const warehouses = pgTable("warehouses", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

