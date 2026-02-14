import { Elysia, t } from 'elysia'
import { CatalogService } from './service.js'

export const catalogRouter = new Elysia({ prefix: '/catalog' })
  .get(
    '/',
    async ({ query }) => {
      const filters: any = {}
      const q = (query as any)?.q
      const status = (query as any)?.status
      const offset = (query as any)?.offset
      const limit = (query as any)?.limit
      if (q) filters.search = q
      if (status) filters.status = status
      if (offset) filters.offset = Number(offset)
      if (limit) filters.limit = Number(limit)
      const result = await CatalogService.list(Object.keys(filters).length ? filters : undefined)
      return {
        data: result.externalProducts,
        total: result.total,
        offset: result.offset,
        limit: filters.limit ?? null,
      }
    },
    {
      query: t.Object({
        q: t.Optional(t.String()),
        status: t.Optional(t.Union([t.Literal('active'), t.Literal('inactive'), t.Literal('archived')])),
        offset: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
      detail: { tags: ['catalog'], summary: 'Listar catálogo externo' },
    }
  )
  .get(
    '/:id',
    async ({ params }) => {
      const product = await CatalogService.getById(Number(params.id))
      return { data: product }
    },
    { params: t.Object({ id: t.Numeric() }), detail: { tags: ['catalog'], summary: 'Obtener external product por ID' } }
  )
  .post(
    '/',
    async ({ body }) => {
      const product = await CatalogService.create(body)
      return { data: product }
    },
    {
      body: t.Object({
        sku: t.String(),
        name: t.String(),
        status: t.Optional(t.Union([t.Literal('active'), t.Literal('inactive'), t.Literal('archived')])),
        basePrice: t.Number(),
        currency: t.Optional(t.String()),
        imageUrl: t.Optional(t.String()),
      }),
      detail: { tags: ['catalog'], summary: 'Crear external product' },
    }
  )
  .put(
    '/:id',
    async ({ params, body }) => {
      const product = await CatalogService.update(Number(params.id), body)
      return { data: product }
    },
    {
      params: t.Object({ id: t.Numeric() }),
      body: t.Object({
        sku: t.Optional(t.String()),
        name: t.Optional(t.String()),
        status: t.Optional(t.Union([t.Literal('active'), t.Literal('inactive'), t.Literal('archived')])),
        basePrice: t.Optional(t.Number()),
        currency: t.Optional(t.String()),
        imageUrl: t.Optional(t.String()),
      }),
      detail: { tags: ['catalog'], summary: 'Actualizar external product' },
    }
  )
  .delete(
    '/:id',
    async ({ params }) => {
      const product = await CatalogService.remove(Number(params.id))
      return { message: 'Eliminado', data: product }
    },
    { params: t.Object({ id: t.Numeric() }), detail: { tags: ['catalog'], summary: 'Eliminar external product' } }
  )

