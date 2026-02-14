import { db } from '../db.js'
import { shipments, shipmentEvents } from './schema.js'
import { and, desc, eq } from 'drizzle-orm'
import { emitPermitAuditLog } from '../audit/permit-client.js'

export type ShipmentStatus =
  | 'pending'
  | 'packed'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'exception'
  | 'cancelled'

export type ShipmentEventType =
  | 'created'
  | 'packed'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception'

export interface CreateShipmentInput {
  orderId: number
  status?: ShipmentStatus
  carrier?: string
  trackingNumber?: string
  trackingUrl?: string
}

export interface AddShipmentEventInput {
  type: ShipmentEventType
  location?: string
  message?: string
  occurredAt?: string
}

export class ShipmentsService {
  static async list(filters?: { orderId?: number }) {
    if (filters?.orderId) {
      return await db.select().from(shipments).where(eq(shipments.orderId, filters.orderId)).orderBy(desc(shipments.updatedAt))
    }
    return await db.select().from(shipments).orderBy(desc(shipments.updatedAt))
  }

  static async getById(id: number) {
    const rows = await db.select().from(shipments).where(eq(shipments.id, id))
    if (rows.length === 0) throw new Error(`Shipment con ID ${id} no encontrado`)
    const events = await db.select().from(shipmentEvents).where(eq(shipmentEvents.shipmentId, id)).orderBy(desc(shipmentEvents.occurredAt))
    return { ...rows[0]!, events }
  }

  static async create(data: CreateShipmentInput) {
    const result = await db.insert(shipments).values({
      orderId: data.orderId,
      status: (data.status || 'pending') as any,
      carrier: data.carrier,
      trackingNumber: data.trackingNumber,
      trackingUrl: data.trackingUrl,
      updatedAt: new Date(),
    }).returning()

    const shipment = result[0]!

    await db.insert(shipmentEvents).values({
      shipmentId: shipment.id,
      type: 'created' as any,
      message: 'Shipment creado',
      occurredAt: new Date(),
    })

    await emitPermitAuditLog({
      userId: null,
      action: 'create',
      entityType: 'shipments',
      entityId: shipment.id,
      changes: { after: shipment },
      metadata: { source: 'logistic-backend' },
    })

    return await this.getById(shipment.id)
  }

  static async updateStatus(id: number, toStatus: ShipmentStatus, reason?: string) {
    const before = await this.getById(id)
    await db.update(shipments).set({ status: toStatus as any, updatedAt: new Date() }).where(eq(shipments.id, id))

    await db.insert(shipmentEvents).values({
      shipmentId: id,
      type: (toStatus === 'delivered' ? 'delivered' : toStatus === 'exception' ? 'exception' : 'in_transit') as any,
      message: reason || `Status cambiado a ${toStatus}`,
      occurredAt: new Date(),
    })

    const after = await this.getById(id)
    await emitPermitAuditLog({
      userId: null,
      action: 'status_change',
      entityType: 'shipments',
      entityId: id,
      changes: { before, after: { status: toStatus } },
      metadata: { source: 'logistic-backend', reason },
    })
    return after
  }

  static async addEvent(id: number, input: AddShipmentEventInput) {
    await this.getById(id)

    const created = await db.insert(shipmentEvents).values({
      shipmentId: id,
      type: input.type as any,
      location: input.location,
      message: input.message,
      occurredAt: input.occurredAt ? new Date(input.occurredAt) : new Date(),
    }).returning()

    await emitPermitAuditLog({
      userId: null,
      action: 'event_added',
      entityType: 'shipments',
      entityId: id,
      changes: { after: created[0] },
      metadata: { source: 'logistic-backend' },
    })

    return created[0]!
  }
}

