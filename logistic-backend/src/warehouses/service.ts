import { db } from '../db.js'
import { warehouses } from './schema.js'
import { eq } from 'drizzle-orm'
import { emitPermitAuditLog } from '../audit/permit-client.js'

export interface CreateWarehouseInput {
  code: string
  name: string
}

export interface UpdateWarehouseInput {
  code?: string
  name?: string
}

export class WarehousesService {
  static async list() {
    return await db.select().from(warehouses)
  }

  static async getById(id: number) {
    const rows = await db.select().from(warehouses).where(eq(warehouses.id, id))
    if (rows.length === 0) throw new Error(`Warehouse con ID ${id} no encontrado`)
    return rows[0]!
  }

  static async create(data: CreateWarehouseInput) {
    const result = await db.insert(warehouses).values({
      code: data.code,
      name: data.name,
    }).returning()

    await emitPermitAuditLog({
      userId: null,
      action: 'create',
      entityType: 'warehouses',
      entityId: result[0]!.id,
      changes: { after: result[0] },
      metadata: { source: 'logistic-backend' },
    })

    return result[0]!
  }

  static async update(id: number, data: UpdateWarehouseInput) {
    const before = await this.getById(id)
    const updateData: any = {}
    if (data.code !== undefined) updateData.code = data.code
    if (data.name !== undefined) updateData.name = data.name

    const result = await db.update(warehouses).set(updateData).where(eq(warehouses.id, id)).returning()

    await emitPermitAuditLog({
      userId: null,
      action: 'update',
      entityType: 'warehouses',
      entityId: id,
      changes: { before, after: result[0] },
      metadata: { source: 'logistic-backend' },
    })

    return result[0]!
  }

  static async remove(id: number) {
    const before = await this.getById(id)
    const result = await db.delete(warehouses).where(eq(warehouses.id, id)).returning()

    await emitPermitAuditLog({
      userId: null,
      action: 'delete',
      entityType: 'warehouses',
      entityId: id,
      changes: { before },
      metadata: { source: 'logistic-backend' },
    })

    return result[0]!
  }
}

