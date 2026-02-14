import { db } from '../db.js'
import { internalToExternalMappings } from './schema.js'
import { eq } from 'drizzle-orm'
import { emitPermitAuditLog } from '../audit/permit-client.js'

export interface CreateMappingInput {
  internalItemId: number
  externalProductId: number
  note?: string
}

export class MappingsService {
  static async list(filters?: { internalItemId?: number; externalProductId?: number }) {
    if (filters?.internalItemId) {
      return await db.select().from(internalToExternalMappings).where(eq(internalToExternalMappings.internalItemId, filters.internalItemId))
    }
    if (filters?.externalProductId) {
      return await db.select().from(internalToExternalMappings).where(eq(internalToExternalMappings.externalProductId, filters.externalProductId))
    }
    return await db.select().from(internalToExternalMappings)
  }

  static async create(data: CreateMappingInput) {
    const result = await db.insert(internalToExternalMappings).values({
      internalItemId: data.internalItemId,
      externalProductId: data.externalProductId,
      note: data.note,
    }).returning()

    await emitPermitAuditLog({
      userId: null,
      action: 'create',
      entityType: 'internal_to_external_mappings',
      entityId: result[0]!.id,
      changes: { after: result[0] },
      metadata: { source: 'logistic-backend' },
    })

    return result[0]!
  }
}

