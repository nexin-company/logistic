import { Elysia } from 'elysia'
import { apiKeysRouter } from '../src/api-keys/router.js'
import { catalogRouter } from '../src/catalog/router.js'
import { warehousesRouter } from '../src/warehouses/router.js'
import { stockRouter } from '../src/stock/router.js'
import { mappingsRouter } from '../src/mappings/router.js'
import { availabilityRouter } from '../src/availability/router.js'
import { shipmentsRouter } from '../src/shipments/router.js'

/**
 * API v1 - Logistics (catálogo externo + stock + warehouses + mappings + shipments)
 */
export const v1Routes = new Elysia({ prefix: '/v1' })
  .use(apiKeysRouter)
  .use(catalogRouter)
  .use(warehousesRouter)
  .use(stockRouter)
  .use(mappingsRouter)
  .use(availabilityRouter)
  .use(shipmentsRouter)

