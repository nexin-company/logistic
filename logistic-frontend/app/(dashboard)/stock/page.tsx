import { stockApi, warehousesApi, catalogApi, type StockLevel, type Warehouse, type ExternalProduct } from '@/lib/api-server';
import { StockLevelsPageClient } from './stock-levels-page-client';

export const dynamic = 'force-dynamic';

export default async function StockLevelsPage() {
  let stockLevels: StockLevel[] = [];
  let warehouses: Warehouse[] = [];
  let externalProducts: ExternalProduct[] = [];

  try {
    const [levels, whs, products] = await Promise.all([
      stockApi.getAll().catch(() => []),
      warehousesApi.getAll().catch(() => []),
      catalogApi.getAll({ limit: 1000 }).catch(() => ({ externalProducts: [], total: 0, offset: null })),
    ]);
    stockLevels = Array.isArray(levels) ? levels : [];
    warehouses = Array.isArray(whs) ? whs : [];
    externalProducts = Array.isArray(products.externalProducts) ? products.externalProducts : [];
  } catch (error) {
    console.error('Error fetching stock levels:', error);
  }

  return (
    <StockLevelsPageClient
      initialStockLevels={stockLevels}
      warehouses={warehouses}
      externalProducts={externalProducts}
    />
  );
}

