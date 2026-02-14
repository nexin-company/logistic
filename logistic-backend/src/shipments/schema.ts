import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const shipmentStatusEnum = pgEnum('shipment_status', [
  'pending',
  'packed',
  'shipped',
  'in_transit',
  'delivered',
  'exception',
  'cancelled',
]);

export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  status: shipmentStatusEnum("status").notNull().default("pending"),
  carrier: text("carrier"),
  trackingNumber: text("tracking_number"),
  trackingUrl: text("tracking_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const shipmentEventTypeEnum = pgEnum('shipment_event_type', [
  'created',
  'packed',
  'picked_up',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'exception',
]);

export const shipmentEvents = pgTable("shipment_events", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").notNull().references(() => shipments.id, { onDelete: 'cascade' }),
  type: shipmentEventTypeEnum("type").notNull(),
  location: text("location"),
  message: text("message"),
  occurredAt: timestamp("occurred_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const shipmentsRelations = relations(shipments, ({ many }) => ({
  events: many(shipmentEvents),
}));

export const shipmentEventsRelations = relations(shipmentEvents, ({ one }) => ({
  shipment: one(shipments, {
    fields: [shipmentEvents.shipmentId],
    references: [shipments.id],
  }),
}));

