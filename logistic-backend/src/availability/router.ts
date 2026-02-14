import { Elysia, t } from 'elysia'
import { db } from '../db.js'
import { stockLevels } from '../stock/schema.js'
import { eq, and } from 'drizzle-orm'

export const availabilityRouter = new Elysia({ prefix: '/availability' })
  .get(
    '/',
    async ({ query }) => {
      const externalProductId = (query as any)?.externalProductId ? Number((query as any).externalProductId) : undefined
      const warehouseId = (query as any)?.warehouseId ? Number((query as any).warehouseId) : undefined

      const conditions: any[] = []
      if (externalProductId) conditions.push(eq(stockLevels.externalProductId, externalProductId))
      if (warehouseId) conditions.push(eq(stockLevels.warehouseId, warehouseId))

      const rows = await db
        .select()
        .from(stockLevels)
        .where(conditions.length ? and(...conditions) : undefined as any)

      const availability = rows.map((r) => ({
        warehouseId: r.warehouseId,
        externalProductId: r.externalProductId,
        onHand: r.onHand,
        reserved: r.reserved,
        available: Math.max(0, r.onHand - r.reserved),
        updatedAt: r.updatedAt,
      }));
      return { data: availability };
    },
    {
      query: t.Object({
        externalProductId: t.Optional(t.String()),
        warehouseId: t.Optional(t.String()),
      }),
      detail: { tags: ['availability'], summary: 'Consultar disponibilidad (onHand-reserved)' },
    }
  )

