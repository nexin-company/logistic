import { Elysia, t } from 'elysia'
import { MappingsService } from './service.js'

export const mappingsRouter = new Elysia({ prefix: '/mappings/internal-to-external' })
  .get(
    '/',
    async ({ query }) => {
      const internalItemId = (query as any)?.internalItemId ? Number((query as any).internalItemId) : undefined
      const externalProductId = (query as any)?.externalProductId ? Number((query as any).externalProductId) : undefined
      const mappings = await MappingsService.list({ internalItemId, externalProductId })
      return { data: mappings }
    },
    {
      query: t.Object({
        internalItemId: t.Optional(t.String()),
        externalProductId: t.Optional(t.String()),
      }),
      detail: { tags: ['mappings'], summary: 'Listar mappings internal→external' },
    }
  )
  .post(
    '/',
    async ({ body }) => {
      const mapping = await MappingsService.create(body)
      return { data: mapping }
    },
    {
      body: t.Object({
        internalItemId: t.Number(),
        externalProductId: t.Number(),
        note: t.Optional(t.String()),
      }),
      detail: { tags: ['mappings'], summary: 'Crear mapping internal→external' },
    }
  )

