'use client';

import { useState } from 'react';
import { StockLevel, stockApi, type Warehouse, type ExternalProduct } from '@/lib/api';
import { StockLevelsTable } from './stock-levels-table';
import { StockAdjustDialog } from './stock-adjust-dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface StockLevelsPageClientProps {
  initialStockLevels: StockLevel[];
  warehouses: Warehouse[];
  externalProducts: ExternalProduct[];
}

export function StockLevelsPageClient({
  initialStockLevels,
  warehouses,
  externalProducts,
}: StockLevelsPageClientProps) {
  const [stockLevels, setStockLevels] = useState<StockLevel[]>(initialStockLevels);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const result = await stockApi.getAll();
      setStockLevels(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Error al actualizar niveles de stock:', error);
      setStockLevels([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 space-y-4">
      <div className="flex flex-col gap-3 lg:gap-0 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1" />
        <div className="flex items-center gap-2 sm:w-auto">
          <Button size="sm" className="h-8 gap-1" onClick={() => setShowAdjustDialog(true)}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Ajustar Stock
            </span>
          </Button>
        </div>
      </div>

      <StockLevelsTable
        stockLevels={stockLevels}
        warehouses={warehouses}
        externalProducts={externalProducts}
        isLoading={isLoading}
      />

      <StockAdjustDialog
        open={showAdjustDialog}
        onOpenChange={setShowAdjustDialog}
        warehouses={warehouses}
        externalProducts={externalProducts}
        onSuccess={handleRefresh}
      />
    </div>
  );
}

