'use client';

import { useState } from 'react';
import { Shipment, shipmentsApi } from '@/lib/api';
import { ShipmentsTable } from './shipments-table';
import { TableSkeleton } from '@/components/table-skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { CreateShipmentForm } from './create-shipment-form';

interface ShipmentsPageClientProps {
  initialShipments: Shipment[];
  initialOrderId?: number;
}

export function ShipmentsPageClient({
  initialShipments,
  initialOrderId,
}: ShipmentsPageClientProps) {
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
  const [isLoading, setIsLoading] = useState(false);
  const [orderIdFilter, setOrderIdFilter] = useState<string>(initialOrderId?.toString() || '');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRefresh = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const filters: any = {};
      if (orderIdFilter) filters.orderId = Number(orderIdFilter);
      
      const result = await shipmentsApi.getAll(filters);
      setShipments(result);
    } catch (error) {
      console.error('Error al actualizar shipments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderIdChange = (value: string) => {
    setOrderIdFilter(value);
    const timeoutId = setTimeout(() => {
      handleRefresh();
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  if (isLoading) {
    return <TableSkeleton columns={7} rows={5} />;
  }

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 space-y-4">
      <div className="flex flex-col gap-3 lg:gap-0 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Label htmlFor="orderId" className="text-sm whitespace-nowrap">
              Order ID:
            </Label>
            <Input
              id="orderId"
              type="number"
              placeholder="Filtrar por orden..."
              value={orderIdFilter}
              onChange={(e) => {
                setOrderIdFilter(e.target.value);
                const timeoutId = setTimeout(() => {
                  handleRefresh();
                }, 500);
                return () => clearTimeout(timeoutId);
              }}
              className="w-32"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Crear Shipment</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Shipment</DialogTitle>
                <DialogDescription>
                  Crea un nuevo shipment para una orden
                </DialogDescription>
              </DialogHeader>
              <CreateShipmentForm
                onCreated={async () => {
                  setIsDialogOpen(false);
                  await handleRefresh();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ShipmentsTable shipments={shipments} onRefresh={handleRefresh} />
    </div>
  );
}

