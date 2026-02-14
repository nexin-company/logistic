/**
 * Seed de datos para Logistics Backend (módulo unificado)
 * Ejecutar con: bun run src/seed.ts
 *
 * Este backend es la fuente de verdad para:
 * - Catálogo externo (external_products)
 * - Almacenes (warehouses)
 * - Niveles de stock (stock_levels)
 * - Mapeos Factory→External (internal_to_external_mappings)
 * - Embarques (shipments)
 * - Eventos de embarque (shipment_events)
 *
 * Nota: Los usuarios/RBAC viven en Permit, los items internos en Factory.
 */

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema.js'

const sqlClient = neon(process.env.DATABASE_URL!)
const db = drizzle(sqlClient, { schema })

/* ─── Helpers ─────────────────────────────────────────────────── */

/** Entero aleatorio entre min y max (inclusive) */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** Elige un elemento aleatorio de un array */
function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)]
}

/** Fecha aleatoria entre `daysAgo` y hoy */
function randomDate(daysAgo: number): Date {
  const now = Date.now()
  const past = now - daysAgo * 24 * 60 * 60 * 1000
  return new Date(past + Math.random() * (now - past))
}

/** Fecha futura aleatoria entre hoy y `daysAhead` */
function futureDate(daysAhead: number): Date {
  const now = Date.now()
  return new Date(now + Math.random() * daysAhead * 24 * 60 * 60 * 1000)
}

/* ─── Data Definitions ────────────────────────────────────────── */

const CARRIERS = ['DHL Express', 'FedEx', 'Estafeta', 'UPS', 'Redpack', 'J&T Express'] as const
const CITIES = [
  'CDMX', 'Guadalajara', 'Monterrey', 'Puebla', 'Querétaro',
  'Mérida', 'Cancún', 'Tijuana', 'León', 'Toluca',
] as const

const SHIPMENT_STATUSES = ['pending', 'packed', 'shipped', 'in_transit', 'delivered', 'exception', 'cancelled'] as const
const EVENT_TYPES = ['created', 'packed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception'] as const

/**
 * Para simular un flujo realista, definimos secuencias de eventos
 * según el estado final del embarque.
 */
const STATUS_FLOWS: Record<string, { status: typeof SHIPMENT_STATUSES[number]; events: typeof EVENT_TYPES[number][] }> = {
  delivered: {
    status: 'delivered',
    events: ['created', 'packed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'],
  },
  in_transit: {
    status: 'in_transit',
    events: ['created', 'packed', 'picked_up', 'in_transit'],
  },
  shipped: {
    status: 'shipped',
    events: ['created', 'packed', 'picked_up'],
  },
  packed: {
    status: 'packed',
    events: ['created', 'packed'],
  },
  pending: {
    status: 'pending',
    events: ['created'],
  },
  exception: {
    status: 'exception',
    events: ['created', 'packed', 'picked_up', 'in_transit', 'exception'],
  },
  cancelled: {
    status: 'cancelled',
    events: ['created'],
  },
}

const FLOW_KEYS = Object.keys(STATUS_FLOWS)

/* ─── Seed Functions ──────────────────────────────────────────── */

async function seedProducts() {
  console.log('📦 Creando productos externos...')

  const values = [
    { sku: 'EXT-PROD-001', name: 'Bolsa Tote Canvas Natural',         status: 'active' as const,   basePrice: '349.00', currency: 'MXN', imageUrl: 'https://placehold.co/400x400/e2e8f0/475569?text=Tote+Canvas' },
    { sku: 'EXT-PROD-002', name: 'Mochila Rolltop Impermeable',       status: 'active' as const,   basePrice: '899.00', currency: 'MXN', imageUrl: 'https://placehold.co/400x400/e2e8f0/475569?text=Mochila+Rolltop' },
    { sku: 'EXT-PROD-003', name: 'Cartera Minimalista Piel',          status: 'active' as const,   basePrice: '599.50', currency: 'MXN', imageUrl: 'https://placehold.co/400x400/e2e8f0/475569?text=Cartera+Piel' },
    { sku: 'EXT-PROD-004', name: 'Cinturón Trenzado Casual',          status: 'active' as const,   basePrice: '279.99', currency: 'MXN', imageUrl: 'https://placehold.co/400x400/e2e8f0/475569?text=Cinturon' },
    { sku: 'EXT-PROD-005', name: 'Estuche Laptop 15"',                status: 'active' as const,   basePrice: '449.00', currency: 'MXN', imageUrl: 'https://placehold.co/400x400/e2e8f0/475569?text=Estuche+Laptop' },
    { sku: 'EXT-PROD-006', name: 'Porta Pasaporte Travel',            status: 'active' as const,   basePrice: '189.00', currency: 'MXN', imageUrl: 'https://placehold.co/400x400/e2e8f0/475569?text=Porta+Pasaporte' },
    { sku: 'EXT-PROD-007', name: 'Riñonera Deportiva Pro',            status: 'active' as const,   basePrice: '329.00', currency: 'MXN', imageUrl: 'https://placehold.co/400x400/e2e8f0/475569?text=Rinonera' },
    { sku: 'EXT-PROD-008', name: 'Bolsa Crossbody Premium',           status: 'inactive' as const, basePrice: '749.00', currency: 'MXN', imageUrl: 'https://placehold.co/400x400/e2e8f0/475569?text=Crossbody' },
    { sku: 'EXT-PROD-009', name: 'Neceser Viaje Organizador',         status: 'active' as const,   basePrice: '219.50', currency: 'MXN', imageUrl: 'https://placehold.co/400x400/e2e8f0/475569?text=Neceser' },
    { sku: 'EXT-PROD-010', name: 'Portafolio Ejecutivo Piel',         status: 'archived' as const, basePrice: '1299.00', currency: 'MXN', imageUrl: 'https://placehold.co/400x400/e2e8f0/475569?text=Portafolio' },
    { sku: 'EXT-PROD-011', name: 'Mochila Urbana Compacta',           status: 'active' as const,   basePrice: '549.00', currency: 'MXN', imageUrl: 'https://placehold.co/400x400/e2e8f0/475569?text=Mochila+Urbana' },
    { sku: 'EXT-PROD-012', name: 'Cangurera Festival Edition',        status: 'active' as const,   basePrice: '199.00', currency: 'MXN', imageUrl: 'https://placehold.co/400x400/e2e8f0/475569?text=Cangurera' },
  ]

  const inserted = await db
    .insert(schema.externalProducts)
    .values(values)
    .onConflictDoNothing()
    .returning()

  console.log(`   ✅ ${inserted.length} productos creados (${values.length - inserted.length} ya existían)`)
  return inserted.length > 0 ? inserted : db.select().from(schema.externalProducts)
}

async function seedWarehouses() {
  console.log('🏭 Creando almacenes...')

  const values = [
    { code: 'WH-CDMX-001', name: 'Almacén Central CDMX' },
    { code: 'WH-GDL-001',  name: 'Almacén Guadalajara' },
    { code: 'WH-MTY-001',  name: 'Almacén Monterrey' },
    { code: 'WH-PUE-001',  name: 'Almacén Puebla' },
    { code: 'WH-QRO-001',  name: 'Almacén Querétaro' },
  ]

  const inserted = await db
    .insert(schema.warehouses)
    .values(values)
    .onConflictDoNothing()
    .returning()

  console.log(`   ✅ ${inserted.length} almacenes creados (${values.length - inserted.length} ya existían)`)
  return inserted.length > 0 ? inserted : db.select().from(schema.warehouses)
}

async function seedStockLevels(
  products: { id: number }[],
  warehouses: { id: number }[],
) {
  console.log('📊 Creando niveles de stock...')

  const values = []
  for (const wh of warehouses) {
    for (const prod of products) {
      values.push({
        warehouseId: wh.id,
        externalProductId: prod.id,
        onHand: randInt(20, 500),
        reserved: randInt(0, 40),
      })
    }
  }

  await db
    .insert(schema.stockLevels)
    .values(values)
    .onConflictDoNothing()

  console.log(`   ✅ ${values.length} niveles de stock creados/verificados`)
  return values.length
}

async function seedMappings(products: { id: number; sku: string }[]) {
  console.log('🔗 Creando mapeos Factory→External...')

  // Simular que items internos de Factory (IDs 1000–1007) se mapean a productos externos
  const count = Math.min(products.length, 8)
  const values = []

  for (let i = 0; i < count; i++) {
    values.push({
      internalItemId: 1000 + i,
      externalProductId: products[i].id,
      note: `Mapeo automático seed — ${products[i].sku}`,
    })
  }

  await db
    .insert(schema.internalToExternalMappings)
    .values(values)
    .onConflictDoNothing()

  console.log(`   ✅ ${values.length} mapeos creados/verificados`)
  return values.length
}

async function seedShipments() {
  console.log('🚚 Creando embarques...')

  // Generar 15 embarques con diferentes estados y flujos
  const shipmentDefs = [
    // Entregados (5)
    { orderId: 2001, flow: 'delivered',  carrier: 'DHL Express', trackingNumber: 'DHL-78901234', trackingUrl: 'https://www.dhl.com/track?id=DHL-78901234' },
    { orderId: 2002, flow: 'delivered',  carrier: 'FedEx',       trackingNumber: 'FDX-56781234', trackingUrl: 'https://www.fedex.com/track?id=FDX-56781234' },
    { orderId: 2003, flow: 'delivered',  carrier: 'Estafeta',    trackingNumber: 'EST-34561234', trackingUrl: 'https://rastreo.estafeta.com/EST-34561234' },
    { orderId: 2007, flow: 'delivered',  carrier: 'UPS',         trackingNumber: 'UPS-11223344', trackingUrl: 'https://www.ups.com/track?id=UPS-11223344' },
    { orderId: 2012, flow: 'delivered',  carrier: 'Redpack',     trackingNumber: 'RPK-99001122', trackingUrl: 'https://www.redpack.com.mx/rastreo/RPK-99001122' },

    // En tránsito (3)
    { orderId: 2004, flow: 'in_transit', carrier: 'UPS',         trackingNumber: 'UPS-12349876', trackingUrl: 'https://www.ups.com/track?id=UPS-12349876' },
    { orderId: 2008, flow: 'in_transit', carrier: 'DHL Express', trackingNumber: 'DHL-44556677', trackingUrl: 'https://www.dhl.com/track?id=DHL-44556677' },
    { orderId: 2011, flow: 'in_transit', carrier: 'FedEx',       trackingNumber: 'FDX-88776655', trackingUrl: 'https://www.fedex.com/track?id=FDX-88776655' },

    // Enviados (2)
    { orderId: 2005, flow: 'shipped',    carrier: 'Redpack',     trackingNumber: 'RPK-56781234', trackingUrl: 'https://www.redpack.com.mx/rastreo/RPK-56781234' },
    { orderId: 2013, flow: 'shipped',    carrier: 'J&T Express', trackingNumber: 'JNT-33445566', trackingUrl: 'https://www.jtexpress.mx/track/JNT-33445566' },

    // Empacados (1)
    { orderId: 2009, flow: 'packed',     carrier: 'Estafeta',    trackingNumber: null,           trackingUrl: null },

    // Pendientes (2)
    { orderId: 2006, flow: 'pending',    carrier: null,          trackingNumber: null,           trackingUrl: null },
    { orderId: 2014, flow: 'pending',    carrier: null,          trackingNumber: null,           trackingUrl: null },

    // Excepción (1)
    { orderId: 2010, flow: 'exception',  carrier: 'DHL Express', trackingNumber: 'DHL-99887766', trackingUrl: 'https://www.dhl.com/track?id=DHL-99887766' },

    // Cancelado (1)
    { orderId: 2015, flow: 'cancelled',  carrier: null,          trackingNumber: null,           trackingUrl: null },
  ]

  const insertedShipments = []

  for (const def of shipmentDefs) {
    const flow = STATUS_FLOWS[def.flow]
    const baseDate = randomDate(30) // Creado en los últimos 30 días

    // Insertar el embarque
    const [shipment] = await db
      .insert(schema.shipments)
      .values({
        orderId: def.orderId,
        status: flow.status,
        carrier: def.carrier,
        trackingNumber: def.trackingNumber,
        trackingUrl: def.trackingUrl,
      })
      .onConflictDoNothing()
      .returning()

    if (!shipment) continue
    insertedShipments.push(shipment)

    // Insertar los eventos del flujo, con timestamps progresivos
    const eventValues = flow.events.map((eventType, idx) => {
      // Cada evento ocurre unas horas/días después del anterior
      const eventDate = new Date(baseDate.getTime() + idx * randInt(2, 48) * 60 * 60 * 1000)

      return {
        shipmentId: shipment.id,
        type: eventType as typeof EVENT_TYPES[number],
        location: getEventLocation(eventType),
        message: getEventMessage(eventType, def.carrier || 'Paquetería'),
        occurredAt: eventDate,
      }
    })

    await db
      .insert(schema.shipmentEvents)
      .values(eventValues)
      .onConflictDoNothing()
  }

  console.log(`   ✅ ${insertedShipments.length} embarques creados con sus eventos`)
  return insertedShipments.length
}

/* ─── Event helpers ───────────────────────────────────────────── */

function getEventLocation(eventType: string): string {
  switch (eventType) {
    case 'created':          return pick(['Almacén CDMX', 'Almacén Guadalajara', 'Almacén Monterrey'])
    case 'packed':           return pick(['Almacén CDMX', 'Almacén Guadalajara', 'Almacén Monterrey'])
    case 'picked_up':        return pick(['Centro de distribución CDMX', 'Hub logístico GDL', 'Hub logístico MTY'])
    case 'in_transit':       return pick(['Centro de sorteo CDMX', 'Hub nacional GDL', 'Hub Querétaro', 'Centro de distribución Puebla'])
    case 'out_for_delivery': return pick(CITIES.slice()) + ' — En camino al destino'
    case 'delivered':        return pick(CITIES.slice()) + ' — Entregado al destinatario'
    case 'exception':        return pick(['Aduana Laredo', 'Centro de sorteo CDMX', 'Hub Querétaro']) + ' — Incidencia'
    default:                 return 'Ubicación desconocida'
  }
}

function getEventMessage(eventType: string, carrier: string): string {
  switch (eventType) {
    case 'created':          return 'Embarque creado y registrado en el sistema'
    case 'packed':           return 'Paquete empacado y listo para recolección'
    case 'picked_up':        return `Recolectado por ${carrier}`
    case 'in_transit':       return `En tránsito — procesado en hub de ${carrier}`
    case 'out_for_delivery': return `En ruta de entrega final con ${carrier}`
    case 'delivered':        return 'Paquete entregado exitosamente al destinatario'
    case 'exception':        return pick([
      'Dirección incorrecta — intento de entrega fallido',
      'Paquete dañado en tránsito — en revisión',
      'Destinatario ausente — reprogramando entrega',
      'Retención temporal en aduana',
    ])
    default:                 return 'Evento registrado'
  }
}

/* ─── Main ────────────────────────────────────────────────────── */

async function seed() {
  console.log('═══════════════════════════════════════════════════')
  console.log('  🌱 Seed de Logistics Backend (módulo unificado)')
  console.log('═══════════════════════════════════════════════════\n')

  try {
    // 1. Catálogo
    const products = await seedProducts()

    // 2. Almacenes
    const warehouses = await seedWarehouses()

    if (products.length === 0 || warehouses.length === 0) {
      console.log('\n⚠️  No hay productos o almacenes — abortando stock y mapeos')
      return
    }

    // 3. Stock (producto × almacén)
    const stockCount = await seedStockLevels(products, warehouses)

    // 4. Mapeos Factory → External
    const mappingCount = await seedMappings(products as { id: number; sku: string }[])

    // 5. Embarques + Eventos
    const shipmentCount = await seedShipments()

    // Resumen
    console.log('\n═══════════════════════════════════════════════════')
    console.log('  ✅ Seed completado exitosamente')
    console.log('═══════════════════════════════════════════════════')
    console.log(`   📦 Productos externos:          ${products.length}`)
    console.log(`   🏭 Almacenes:                    ${warehouses.length}`)
    console.log(`   📊 Niveles de stock:             ${stockCount}`)
    console.log(`   🔗 Mapeos Factory→External:      ${mappingCount}`)
    console.log(`   🚚 Embarques (con eventos):      ${shipmentCount}`)
    console.log('═══════════════════════════════════════════════════\n')
  } catch (error: any) {
    console.error('\n❌ Error en seed:', error)
    process.exit(1)
  }
}

seed()
