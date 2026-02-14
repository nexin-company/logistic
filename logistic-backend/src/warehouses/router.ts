import { Elysia, t } from 'elysia'
import { WarehousesService } from './service.js'

export const warehousesRouter = new Elysia({ prefix: '/warehouses' })
  .get(
    '/',
    async () => {
      const warehouses = await WarehousesService.list();
      return { data: warehouses };
    },
    { detail: { tags: ['warehouses'], summary: 'Listar warehouses' } }
  )
  .get(
    '/:id',
    async ({ params }) => {
      const warehouse = await WarehousesService.getById(Number(params.id));
      return { data: warehouse };
    },
    { params: t.Object({ id: t.Numeric() }), detail: { tags: ['warehouses'], summary: 'Obtener warehouse por ID' } }
  )
  .post(
    '/',
    async ({ body }) => {
      const warehouse = await WarehousesService.create(body);
      return { data: warehouse };
    },
    { body: t.Object({ code: t.String(), name: t.String() }), detail: { tags: ['warehouses'], summary: 'Crear warehouse' } }
  )
  .put(
    '/:id',
    async ({ params, body }) => {
      const warehouse = await WarehousesService.update(Number(params.id), body);
      return { data: warehouse };
    },
    {
      params: t.Object({ id: t.Numeric() }),
      body: t.Object({ code: t.Optional(t.String()), name: t.Optional(t.String()) }),
      detail: { tags: ['warehouses'], summary: 'Actualizar warehouse' },
    }
  )
  .delete(
    '/:id',
    async ({ params }) => {
      const warehouse = await WarehousesService.remove(Number(params.id));
      return { message: 'Eliminado', data: warehouse };
    },
    { params: t.Object({ id: t.Numeric() }), detail: { tags: ['warehouses'], summary: 'Eliminar warehouse' } }
  )

