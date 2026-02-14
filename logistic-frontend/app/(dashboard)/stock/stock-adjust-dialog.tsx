'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormError } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/lib/toast';
import { stockAdjustSchema, type StockAdjustFormData } from '@/lib/schemas/stock-adjust';
import { stockApi, AdjustStockInput, type Warehouse, type ExternalProduct } from '@/lib/api';

interface StockAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouses: Warehouse[];
  externalProducts: ExternalProduct[];
  onSuccess: () => void;
}

export function StockAdjustDialog({
  open,
  onOpenChange,
  warehouses,
  externalProducts,
  onSuccess,
}: StockAdjustDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StockAdjustFormData>({
    resolver: zodResolver(stockAdjustSchema),
    defaultValues: {
      warehouseId: undefined,
      externalProductId: undefined,
      deltaOnHand: 0,
      deltaReserved: 0,
      reason: '',
    },
  });

  const warehouseId = watch('warehouseId');
  const externalProductId = watch('externalProductId');

  const onSubmit = async (data: StockAdjustFormData) => {
    try {
      const adjustData: AdjustStockInput = {
        warehouseId: data.warehouseId,
        externalProductId: data.externalProductId,
        deltaOnHand: data.deltaOnHand,
        deltaReserved: data.deltaReserved,
        reason: data.reason || undefined,
      };
      await stockApi.adjust(adjustData);
      toast.success('Stock ajustado', 'El stock se ajustó correctamente');
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error al ajustar stock:', error);
      toast.error('Error al ajustar stock', error.message || 'No se pudo ajustar el stock');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajustar Stock</DialogTitle>
          <DialogDescription>
            Ajusta el nivel de stock de un producto en un almacén específico.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField>
            <Label htmlFor="warehouseId">Almacén *</Label>
            <Select
              value={warehouseId?.toString()}
              onValueChange={(value) => setValue('warehouseId', Number(value))}
            >
              <SelectTrigger id="warehouseId" aria-invalid={errors.warehouseId ? 'true' : 'false'}>
                <SelectValue placeholder="Selecciona un almacén" />
              </SelectTrigger>
              <SelectContent>
                {(Array.isArray(warehouses) ? warehouses : []).map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                    {warehouse.code} - {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.warehouseId && <FormError>{errors.warehouseId.message}</FormError>}
          </FormField>

          <FormField>
            <Label htmlFor="externalProductId">Producto Externo *</Label>
            <Select
              value={externalProductId?.toString()}
              onValueChange={(value) => setValue('externalProductId', Number(value))}
            >
              <SelectTrigger id="externalProductId" aria-invalid={errors.externalProductId ? 'true' : 'false'}>
                <SelectValue placeholder="Selecciona un producto externo" />
              </SelectTrigger>
              <SelectContent>
                {(Array.isArray(externalProducts) ? externalProducts : []).map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.sku} - {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.externalProductId && <FormError>{errors.externalProductId.message}</FormError>}
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField>
              <Label htmlFor="deltaOnHand">Cambio en Stock *</Label>
              <Input
                id="deltaOnHand"
                type="number"
                {...register('deltaOnHand')}
                placeholder="0"
                aria-invalid={errors.deltaOnHand ? 'true' : 'false'}
              />
              {errors.deltaOnHand && <FormError>{errors.deltaOnHand.message}</FormError>}
            </FormField>

            <FormField>
              <Label htmlFor="deltaReserved">Cambio en Reservado</Label>
              <Input
                id="deltaReserved"
                type="number"
                {...register('deltaReserved')}
                placeholder="0"
                aria-invalid={errors.deltaReserved ? 'true' : 'false'}
              />
              {errors.deltaReserved && <FormError>{errors.deltaReserved.message}</FormError>}
            </FormField>
          </div>

          <FormField>
            <Label htmlFor="reason">Razón (opcional)</Label>
            <Textarea
              id="reason"
              {...register('reason')}
              placeholder="Razón del ajuste"
              rows={2}
              aria-invalid={errors.reason ? 'true' : 'false'}
            />
            {errors.reason && <FormError>{errors.reason.message}</FormError>}
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Ajustando...' : 'Ajustar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

