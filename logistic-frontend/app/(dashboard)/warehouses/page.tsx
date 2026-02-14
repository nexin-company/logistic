import { warehousesApi, type Warehouse } from '@/lib/api-server';
import { WarehousesPageClient } from './warehouses-page-client';

export const dynamic = 'force-dynamic';

export default async function WarehousesPage() {
  let warehouses: Warehouse[] = [];

  try {
    warehouses = await warehousesApi.getAll().catch(() => []);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
  }

  return (
    <WarehousesPageClient
      initialWarehouses={warehouses}
    />
  );
}

