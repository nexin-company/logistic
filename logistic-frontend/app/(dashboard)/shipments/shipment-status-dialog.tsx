'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
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
import { shipmentsApi, Shipment, UpdateShipmentStatusInput } from '@/lib/api';
import { z } from 'zod';

const updateStatusSchema = z.object({
  toStatus: z.enum(['pending', 'packed', 'shipped', 'in_transit', 'delivered', 'exception', 'cancelled']),
  reason: z.string().optional(),
});

type UpdateStatusFormData = z.infer<typeof updateStatusSchema>;

interface ShipmentStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment: Shipment;
  onSuccess: (updatedShipment: Shipment) => void;
}

export function ShipmentStatusDialog({
  open,
  onOpenChange,
  shipment,
  onSuccess,
}: ShipmentStatusDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateStatusFormData>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      toStatus: shipment.status,
      reason: '',
    },
  });

  const toStatus = watch('toStatus');

  const onSubmit = async (data: UpdateStatusFormData) => {
    try {
      const updateData: UpdateShipmentStatusInput = {
        toStatus: data.toStatus,
        reason: data.reason || undefined,
      };
      const updated = await shipmentsApi.updateStatus(shipment.id, updateData);
      toast.success('Estado actualizado', 'El estado del shipment se actualizó correctamente');
      reset();
      onOpenChange(false);
      onSuccess(updated);
    } catch (error: any) {
      console.error('Error al actualizar estado:', error);
      toast.error('Error al actualizar estado', error.message || 'No se pudo actualizar el estado');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Actualizar Estado del Shipment</DialogTitle>
          <DialogDescription>
            Actualiza el estado del shipment #{shipment.id}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField>
            <Label htmlFor="toStatus">Nuevo Estado *</Label>
            <Select
              value={toStatus}
              onValueChange={(value) => setValue('toStatus', value as any)}
            >
              <SelectTrigger id="toStatus" aria-invalid={errors.toStatus ? 'true' : 'false'}>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="packed">Empacado</SelectItem>
                <SelectItem value="shipped">Enviado</SelectItem>
                <SelectItem value="in_transit">En Tránsito</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
                <SelectItem value="exception">Excepción</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            {errors.toStatus && <FormError>{errors.toStatus.message}</FormError>}
          </FormField>

          <FormField>
            <Label htmlFor="reason">Razón (opcional)</Label>
            <Textarea
              id="reason"
              {...register('reason')}
              placeholder="Razón del cambio de estado"
              rows={3}
              aria-invalid={errors.reason ? 'true' : 'false'}
            />
            {errors.reason && <FormError>{errors.reason.message}</FormError>}
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

