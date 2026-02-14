import { Elysia, t } from 'elysia'
import { ShipmentsService } from './service.js'

export const shipmentsRouter = new Elysia({ prefix: '/shipments' })
  .get(
    '/',
    async ({ query }) => {
      const orderId = (query as any)?.orderId ? Number((query as any).orderId) : undefined
      return await ShipmentsService.list({ orderId })
    },
    {
      query: t.Object({ orderId: t.Optional(t.String()) }),
      detail: { tags: ['shipments'], summary: 'Listar shipments (opcional por orderId)' },
    }
  )
  .get(
    '/:shipmentId',
    async ({ params }) => await ShipmentsService.getById(Number(params.shipmentId)),
    {
      params: t.Object({ shipmentId: t.Numeric() }),
      detail: { tags: ['shipments'], summary: 'Obtener shipment por ID (incluye events)' },
    }
  )
  .post(
    '/',
    async ({ body }) => await ShipmentsService.create(body),
    {
      body: t.Object({
        orderId: t.Number(),
        status: t.Optional(
          t.Union([
            t.Literal('pending'),
            t.Literal('packed'),
            t.Literal('shipped'),
            t.Literal('in_transit'),
            t.Literal('delivered'),
            t.Literal('exception'),
            t.Literal('cancelled'),
          ])
        ),
        carrier: t.Optional(t.String()),
        trackingNumber: t.Optional(t.String()),
        trackingUrl: t.Optional(t.String()),
      }),
      detail: { tags: ['shipments'], summary: 'Crear shipment' },
    }
  )
  .put(
    '/:shipmentId/status',
    async ({ params, body }) => await ShipmentsService.updateStatus(Number(params.shipmentId), body.toStatus, body.reason),
    {
      params: t.Object({ shipmentId: t.Numeric() }),
      body: t.Object({
        toStatus: t.Union([
          t.Literal('pending'),
          t.Literal('packed'),
          t.Literal('shipped'),
          t.Literal('in_transit'),
          t.Literal('delivered'),
          t.Literal('exception'),
          t.Literal('cancelled'),
        ]),
        reason: t.Optional(t.String()),
      }),
      detail: { tags: ['shipments'], summary: 'Actualizar status de shipment' },
    }
  )
  .post(
    '/:shipmentId/events',
    async ({ params, body }) => await ShipmentsService.addEvent(Number(params.shipmentId), body),
    {
      params: t.Object({ shipmentId: t.Numeric() }),
      body: t.Object({
        type: t.Union([
          t.Literal('created'),
          t.Literal('packed'),
          t.Literal('picked_up'),
          t.Literal('in_transit'),
          t.Literal('out_for_delivery'),
          t.Literal('delivered'),
          t.Literal('exception'),
        ]),
        location: t.Optional(t.String()),
        message: t.Optional(t.String()),
        occurredAt: t.Optional(t.String()),
      }),
      detail: { tags: ['shipments'], summary: 'Agregar evento de tracking' },
    }
  )

