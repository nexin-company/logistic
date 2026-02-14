import { Elysia, t } from 'elysia'
import { db } from '../db.js'
import { stockLevels } from './schema.js'
import { and, eq } from 'drizzle-orm'
import { emitPermitAuditLog } from '../audit/permit-client.js'

export const stockRouter = new Elysia({ prefix: '/stock' })
  .get(
    '/',
    async ({ query }) => {
      const externalProductId = (query as any)?.externalProductId ? Number((query as any).externalProductId) : undefined;
      const warehouseId = (query as any)?.warehouseId ? Number((query as any).warehouseId) : undefined;

      const conditions: any[] = [];
      if (externalProductId) conditions.push(eq(stockLevels.externalProductId, externalProductId));
      if (warehouseId) conditions.push(eq(stockLevels.warehouseId, warehouseId));

      const rows = await db
        .select()
        .from(stockLevels)
        .where(conditions.length ? and(...conditions) : undefined as any);

      return { data: rows };
    },
    {
      query: t.Object({
        externalProductId: t.Optional(t.String()),
        warehouseId: t.Optional(t.String()),
      }),
      detail: { tags: ['stock'], summary: 'Listar stock levels' },
    }
  )
  .post(
    '/adjust',
    async ({ body }) => {
      const existing = await db
        .select()
        .from(stockLevels)
        .where(and(eq(stockLevels.warehouseId, body.warehouseId), eq(stockLevels.externalProductId, body.externalProductId)))

      if (existing.length === 0) {
        const inserted = await db.insert(stockLevels).values({
          warehouseId: body.warehouseId,
          externalProductId: body.externalProductId,
          onHand: Math.max(0, body.deltaOnHand),
          reserved: Math.max(0, body.deltaReserved || 0),
          updatedAt: new Date(),
        }).returning()

        await emitPermitAuditLog({
          userId: null,
          action: 'stock_adjust',
          entityType: 'stock_levels',
          entityId: inserted[0]!.id,
          changes: { after: inserted[0] },
          metadata: { source: 'logistic-backend', reason: body.reason },
        })

        return { data: inserted[0]! };
      }

      const before = existing[0]!
      const newOnHand = Math.max(0, (before.onHand || 0) + body.deltaOnHand)
      const newReserved = Math.max(0, (before.reserved || 0) + (body.deltaReserved || 0))

      const updated = await db.update(stockLevels).set({
        onHand: newOnHand,
        reserved: newReserved,
        updatedAt: new Date(),
      }).where(eq(stockLevels.id, before.id)).returning()

      await emitPermitAuditLog({
        userId: null,
        action: 'stock_adjust',
        entityType: 'stock_levels',
        entityId: before.id,
        changes: { before, after: updated[0] },
        metadata: { source: 'logistic-backend', reason: body.reason },
      })

      return { data: updated[0]! };
    },
    {
      body: t.Object({
        warehouseId: t.Number(),
        externalProductId: t.Number(),
        deltaOnHand: t.Number(),
        deltaReserved: t.Optional(t.Number()),
        reason: t.Optional(t.String()),
      }),
      detail: { tags: ['stock'], summary: 'Ajustar stock levels (upsert) - usado por Procurement' },
    }
  )

