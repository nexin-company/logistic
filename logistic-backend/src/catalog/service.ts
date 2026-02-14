import { db } from '../db.js'
import { externalProducts } from './schema.js'
import { and, eq, like, or, sql } from 'drizzle-orm'
import { emitPermitAuditLog } from '../audit/permit-client.js'

export type ExternalProductStatus = 'active' | 'inactive' | 'archived'

export interface ExternalProductFilters {
  status?: ExternalProductStatus
  search?: string
  offset?: number
  limit?: number
}

export interface CreateExternalProductInput {
  sku: string
  name: string
  status?: ExternalProductStatus
  basePrice: number
  currency?: string
  imageUrl?: string
}

export interface UpdateExternalProductInput {
  sku?: string
  name?: string
  status?: ExternalProductStatus
  basePrice?: number
  currency?: string
  imageUrl?: string
}

export class CatalogService {
  static async list(filters?: ExternalProductFilters) {
    const conditions: any[] = []

    if (filters?.status) conditions.push(eq(externalProducts.status, filters.status))
    if (filters?.search) {
      conditions.push(or(like(externalProducts.name, `%${filters.search}%`), like(externalProducts.sku, `%${filters.search}%`))!)
    }

    const countQuery =
      conditions.length > 0
        ? db.select({ count: sql<number>`count(*)` }).from(externalProducts).where(and(...conditions))
        : db.select({ count: sql<number>`count(*)` }).from(externalProducts)
    const [countResult] = await countQuery
    const total = Number(countResult?.count || 0)

    let query = db.select().from(externalProducts)
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any
    }
    if (filters?.limit) query = query.limit(filters.limit) as any
    if (filters?.offset) query = query.offset(filters.offset) as any

    const rows = await query
    return {
      externalProducts: rows.map((p) => ({ ...p, basePrice: Number(p.basePrice) })),
      total,
      offset: filters?.offset || null,
    }
  }

  static async getById(id: number) {
    const rows = await db.select().from(externalProducts).where(eq(externalProducts.id, id))
    if (rows.length === 0) throw new Error(`External product con ID ${id} no encontrado`)
    return { ...rows[0]!, basePrice: Number(rows[0]!.basePrice) }
  }

  static async create(data: CreateExternalProductInput) {
    const result = await db.insert(externalProducts).values({
      sku: data.sku,
      name: data.name,
      status: data.status || 'active',
      basePrice: data.basePrice.toString(),
      currency: data.currency || 'MXN',
      imageUrl: data.imageUrl || null,
      updatedAt: new Date(),
    }).returning()

    await emitPermitAuditLog({
      userId: null,
      action: 'create',
      entityType: 'external_products',
      entityId: result[0]!.id,
      changes: { after: result[0] },
      metadata: { source: 'logistic-backend' },
    })

    return { ...result[0]!, basePrice: Number(result[0]!.basePrice) }
  }

  static async update(id: number, data: UpdateExternalProductInput) {
    const before = await this.getById(id)
    const updateData: any = { updatedAt: new Date() }
    if (data.sku !== undefined) updateData.sku = data.sku
    if (data.name !== undefined) updateData.name = data.name
    if (data.status !== undefined) updateData.status = data.status
    if (data.basePrice !== undefined) updateData.basePrice = data.basePrice.toString()
    if (data.currency !== undefined) updateData.currency = data.currency
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl

    const result = await db.update(externalProducts).set(updateData).where(eq(externalProducts.id, id)).returning()
    if (result.length === 0) throw new Error('No se pudo actualizar external product')

    await emitPermitAuditLog({
      userId: null,
      action: 'update',
      entityType: 'external_products',
      entityId: id,
      changes: { before, after: result[0] },
      metadata: { source: 'logistic-backend' },
    })

    return { ...result[0]!, basePrice: Number(result[0]!.basePrice) }
  }

  static async remove(id: number) {
    const before = await this.getById(id)
    const result = await db.delete(externalProducts).where(eq(externalProducts.id, id)).returning()

    await emitPermitAuditLog({
      userId: null,
      action: 'delete',
      entityType: 'external_products',
      entityId: id,
      changes: { before },
      metadata: { source: 'logistic-backend' },
    })

    return result[0]!
  }
}

