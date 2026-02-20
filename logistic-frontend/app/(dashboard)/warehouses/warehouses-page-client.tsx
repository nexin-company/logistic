'use client';

import { useState } from 'react';
import { warehousesApi, type Warehouse } from '@/lib/api';
import { WarehousesTable } from './warehouses-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WarehousesPageClientProps {
  initialWarehouses: Warehouse[];
}

export function WarehousesPageClient({
  initialWarehouses,
}: WarehousesPageClientProps) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses);
  const router = useRouter();

  const handleRefresh = async () => {
    try {
      const updated = await warehousesApi.getAll();
      setWarehouses(updated);
    } catch (error) {
      console.error('Error refreshing warehouses:', error);
    }
  };

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Button onClick={handleRefresh} variant="outline">
          Actualizar
        </Button>
      </div>
      <WarehousesTable warehouses={warehouses} onRefresh={handleRefresh} />
    </div>
  );
}

