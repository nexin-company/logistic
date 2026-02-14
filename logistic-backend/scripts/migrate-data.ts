/**
 * Script de migración de datos de Inventory y Shipments a Logistics
 * 
 * Este script migra todos los datos de las bases de datos de Inventory y Shipments
 * a la nueva base de datos unificada de Logistics.
 * 
 * Uso:
 *   bun run scripts/migrate-data.ts
 * 
 * Variables de entorno requeridas:
 *   - INVENTORY_DATABASE_URL: URL de conexión a la BD de Inventory
 *   - SHIPMENTS_DATABASE_URL: URL de conexión a la BD de Shipments
 *   - DATABASE_URL: URL de conexión a la nueva BD de Logistics
 */

import { neon } from '@neondatabase/serverless';

const INVENTORY_DB_URL = process.env.INVENTORY_DATABASE_URL || '';
const SHIPMENTS_DB_URL = process.env.SHIPMENTS_DATABASE_URL || '';
const LOGISTIC_DB_URL = process.env.DATABASE_URL || '';

if (!INVENTORY_DB_URL || !SHIPMENTS_DB_URL || !LOGISTIC_DB_URL) {
  console.error('❌ Error: Se requieren las siguientes variables de entorno:');
  console.error('   - INVENTORY_DATABASE_URL');
  console.error('   - SHIPMENTS_DATABASE_URL');
  console.error('   - DATABASE_URL (para Logistics)');
  process.exit(1);
}

const inventorySql = neon(INVENTORY_DB_URL);
const shipmentsSql = neon(SHIPMENTS_DB_URL);
const logisticSql = neon(LOGISTIC_DB_URL);

interface MigrationReport {
  apiKeys: { from: number; to: number; duplicates: number };
  externalProducts: { from: number; to: number };
  warehouses: { from: number; to: number };
  stockLevels: { from: number; to: number };
  mappings: { from: number; to: number };
  shipments: { from: number; to: number };
  shipmentEvents: { from: number; to: number };
  errors: string[];
}

async function migrateData(): Promise<MigrationReport> {
  const report: MigrationReport = {
    apiKeys: { from: 0, to: 0, duplicates: 0 },
    externalProducts: { from: 0, to: 0 },
    warehouses: { from: 0, to: 0 },
    stockLevels: { from: 0, to: 0 },
    mappings: { from: 0, to: 0 },
    shipments: { from: 0, to: 0 },
    shipmentEvents: { from: 0, to: 0 },
    errors: [],
  };

  try {
    console.log('🚀 Iniciando migración de datos...\n');

    // 1. Migrar API Keys (unificar, evitar duplicados)
    console.log('📦 Migrando API Keys...');
    const inventoryApiKeys = await inventorySql`SELECT * FROM api_keys ORDER BY id`;
    const shipmentsApiKeys = await shipmentsSql`SELECT * FROM api_keys ORDER BY id`;
    report.apiKeys.from = inventoryApiKeys.length + shipmentsApiKeys.length;

    const existingKeyHashes = new Set<string>();
    const apiKeysToInsert: any[] = [];

    for (const key of [...inventoryApiKeys, ...shipmentsApiKeys]) {
      if (!existingKeyHashes.has(key.key_hash)) {
        existingKeyHashes.add(key.key_hash);
        apiKeysToInsert.push(key);
      } else {
        report.apiKeys.duplicates++;
      }
    }

    if (apiKeysToInsert.length > 0) {
      for (const key of apiKeysToInsert) {
        try {
          await logisticSql`
            INSERT INTO api_keys (key_hash, name, scopes, rate_limit, expires_at, created_by, created_at, last_used_at, is_active)
            VALUES (${key.key_hash}, ${key.name}, ${JSON.stringify(key.scopes)}, ${key.rate_limit}, ${key.expires_at}, ${key.created_by}, ${key.created_at}, ${key.last_used_at}, ${key.is_active})
            ON CONFLICT (key_hash) DO NOTHING
          `;
          report.apiKeys.to++;
        } catch (error: any) {
          report.errors.push(`Error insertando API key ${key.id}: ${error.message}`);
        }
      }
    }
    console.log(`   ✅ API Keys: ${report.apiKeys.to} migrados (${report.apiKeys.duplicates} duplicados omitidos)\n`);

    // 2. Migrar External Products
    console.log('📦 Migrando External Products...');
    const externalProducts = await inventorySql`SELECT * FROM external_products ORDER BY id`;
    report.externalProducts.from = externalProducts.length;

    for (const product of externalProducts) {
      try {
        await logisticSql`
          INSERT INTO external_products (id, sku, name, status, base_price, currency, image_url, created_at, updated_at)
          VALUES (${product.id}, ${product.sku}, ${product.name}, ${product.status}, ${product.base_price}, ${product.currency}, ${product.image_url}, ${product.created_at}, ${product.updated_at})
          ON CONFLICT (id) DO NOTHING
        `;
        report.externalProducts.to++;
      } catch (error: any) {
        report.errors.push(`Error insertando external product ${product.id}: ${error.message}`);
      }
    }
    console.log(`   ✅ External Products: ${report.externalProducts.to} migrados\n`);

    // 3. Migrar Warehouses
    console.log('📦 Migrando Warehouses...');
    const warehouses = await inventorySql`SELECT * FROM warehouses ORDER BY id`;
    report.warehouses.from = warehouses.length;

    for (const warehouse of warehouses) {
      try {
        await logisticSql`
          INSERT INTO warehouses (id, code, name, created_at)
          VALUES (${warehouse.id}, ${warehouse.code}, ${warehouse.name}, ${warehouse.created_at})
          ON CONFLICT (id) DO NOTHING
        `;
        report.warehouses.to++;
      } catch (error: any) {
        report.errors.push(`Error insertando warehouse ${warehouse.id}: ${error.message}`);
      }
    }
    console.log(`   ✅ Warehouses: ${report.warehouses.to} migrados\n`);

    // 4. Migrar Stock Levels
    console.log('📦 Migrando Stock Levels...');
    const stockLevels = await inventorySql`SELECT * FROM stock_levels ORDER BY id`;
    report.stockLevels.from = stockLevels.length;

    for (const stock of stockLevels) {
      try {
        await logisticSql`
          INSERT INTO stock_levels (id, warehouse_id, external_product_id, on_hand, reserved, updated_at)
          VALUES (${stock.id}, ${stock.warehouse_id}, ${stock.external_product_id}, ${stock.on_hand}, ${stock.reserved}, ${stock.updated_at})
          ON CONFLICT (id) DO NOTHING
        `;
        report.stockLevels.to++;
      } catch (error: any) {
        report.errors.push(`Error insertando stock level ${stock.id}: ${error.message}`);
      }
    }
    console.log(`   ✅ Stock Levels: ${report.stockLevels.to} migrados\n`);

    // 5. Migrar Mappings
    console.log('📦 Migrando Mappings...');
    const mappings = await inventorySql`SELECT * FROM internal_to_external_mappings ORDER BY id`;
    report.mappings.from = mappings.length;

    for (const mapping of mappings) {
      try {
        await logisticSql`
          INSERT INTO internal_to_external_mappings (id, internal_item_id, external_product_id, note, created_at)
          VALUES (${mapping.id}, ${mapping.internal_item_id}, ${mapping.external_product_id}, ${mapping.note}, ${mapping.created_at})
          ON CONFLICT (id) DO NOTHING
        `;
        report.mappings.to++;
      } catch (error: any) {
        report.errors.push(`Error insertando mapping ${mapping.id}: ${error.message}`);
      }
    }
    console.log(`   ✅ Mappings: ${report.mappings.to} migrados\n`);

    // 6. Migrar Shipments
    console.log('📦 Migrando Shipments...');
    const shipments = await shipmentsSql`SELECT * FROM shipments ORDER BY id`;
    report.shipments.from = shipments.length;

    for (const shipment of shipments) {
      try {
        await logisticSql`
          INSERT INTO shipments (id, order_id, status, carrier, tracking_number, tracking_url, created_at, updated_at)
          VALUES (${shipment.id}, ${shipment.order_id}, ${shipment.status}, ${shipment.carrier}, ${shipment.tracking_number}, ${shipment.tracking_url}, ${shipment.created_at}, ${shipment.updated_at})
          ON CONFLICT (id) DO NOTHING
        `;
        report.shipments.to++;
      } catch (error: any) {
        report.errors.push(`Error insertando shipment ${shipment.id}: ${error.message}`);
      }
    }
    console.log(`   ✅ Shipments: ${report.shipments.to} migrados\n`);

    // 7. Migrar Shipment Events
    console.log('📦 Migrando Shipment Events...');
    const shipmentEvents = await shipmentsSql`SELECT * FROM shipment_events ORDER BY id`;
    report.shipmentEvents.from = shipmentEvents.length;

    for (const event of shipmentEvents) {
      try {
        await logisticSql`
          INSERT INTO shipment_events (id, shipment_id, type, location, message, occurred_at, created_at)
          VALUES (${event.id}, ${event.shipment_id}, ${event.type}, ${event.location}, ${event.message}, ${event.occurred_at}, ${event.created_at})
          ON CONFLICT (id) DO NOTHING
        `;
        report.shipmentEvents.to++;
      } catch (error: any) {
        report.errors.push(`Error insertando shipment event ${event.id}: ${error.message}`);
      }
    }
    console.log(`   ✅ Shipment Events: ${report.shipmentEvents.to} migrados\n`);

    console.log('✅ Migración completada!\n');
    return report;
  } catch (error: any) {
    console.error('❌ Error durante la migración:', error);
    report.errors.push(`Error general: ${error.message}`);
    return report;
  }
}

async function main() {
  const report = await migrateData();

  console.log('\n📊 Reporte de Migración:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`API Keys:        ${report.apiKeys.to}/${report.apiKeys.from} (${report.apiKeys.duplicates} duplicados omitidos)`);
  console.log(`External Products: ${report.externalProducts.to}/${report.externalProducts.from}`);
  console.log(`Warehouses:      ${report.warehouses.to}/${report.warehouses.from}`);
  console.log(`Stock Levels:    ${report.stockLevels.to}/${report.stockLevels.from}`);
  console.log(`Mappings:        ${report.mappings.to}/${report.mappings.from}`);
  console.log(`Shipments:       ${report.shipments.to}/${report.shipments.from}`);
  console.log(`Shipment Events: ${report.shipmentEvents.to}/${report.shipmentEvents.from}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (report.errors.length > 0) {
    console.log('\n⚠️  Errores encontrados:');
    report.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  } else {
    console.log('\n✅ No se encontraron errores durante la migración.');
  }

  // Validar integridad referencial
  console.log('\n🔍 Validando integridad referencial...');
  try {
    const stockCheck = await logisticSql`
      SELECT COUNT(*) as count FROM stock_levels 
      WHERE warehouse_id NOT IN (SELECT id FROM warehouses)
         OR external_product_id NOT IN (SELECT id FROM external_products)
    `;
    const stockCount = stockCheck[0]?.count ? Number(stockCheck[0].count) : 0;
    if (stockCount > 0) {
      console.warn(`   ⚠️  ${stockCount} stock levels con referencias inválidas`);
    } else {
      console.log('   ✅ Stock levels: referencias válidas');
    }

    const mappingCheck = await logisticSql`
      SELECT COUNT(*) as count FROM internal_to_external_mappings 
      WHERE external_product_id NOT IN (SELECT id FROM external_products)
    `;
    const mappingCount = mappingCheck[0]?.count ? Number(mappingCheck[0].count) : 0;
    if (mappingCount > 0) {
      console.warn(`   ⚠️  ${mappingCount} mappings con referencias inválidas`);
    } else {
      console.log('   ✅ Mappings: referencias válidas');
    }

    const eventCheck = await logisticSql`
      SELECT COUNT(*) as count FROM shipment_events 
      WHERE shipment_id NOT IN (SELECT id FROM shipments)
    `;
    const eventCount = eventCheck[0]?.count ? Number(eventCheck[0].count) : 0;
    if (eventCount > 0) {
      console.warn(`   ⚠️  ${eventCount} shipment events con referencias inválidas`);
    } else {
      console.log('   ✅ Shipment events: referencias válidas');
    }
  } catch (error: any) {
    console.error('   ❌ Error validando integridad:', error.message);
  }

  console.log('\n✨ Proceso completado!');
}

main().catch(console.error);

