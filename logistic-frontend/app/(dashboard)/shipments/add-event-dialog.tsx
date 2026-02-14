'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import { shipmentsApi, Shipment, AddShipmentEventInput } from '@/lib/api';
import { z } from 'zod';

const addEventSchema = z.object({
  type: z.enum(['created', 'packed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception']),
  location: z.string().optional(),
  message: z.string().optional(),
  occurredAt: z.string().optional(),
});

type AddEventFormData = z.infer<typeof addEventSchema>;

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipmentId: number;
  onSuccess: (updatedShipment: Shipment) => void;
}

export function AddEventDialog({
  open,
  onOpenChange,
  shipmentId,
  onSuccess,
}: AddEventDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddEventFormData>({
    resolver: zodResolver(addEventSchema),
    defaultValues: {
      occurredAt: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    },
  });

  const type = watch('type');

  const onSubmit = async (data: AddEventFormData) => {
    try {
      const eventData: AddShipmentEventInput = {
        type: data.type,
        location: data.location || undefined,
        message: data.message || undefined,
        occurredAt: data.occurredAt ? new Date(data.occurredAt).toISOString() : undefined,
      };
      await shipmentsApi.addEvent(shipmentId, eventData);
      // Refrescar el shipment para obtener los eventos actualizados
      const updated = await shipmentsApi.getById(shipmentId);
      toast.success('Evento agregado', 'El evento se agregó correctamente');
      reset();
      onOpenChange(false);
      onSuccess(updated);
    } catch (error: any) {
      console.error('Error al agregar evento:', error);
      toast.error('Error al agregar evento', error.message || 'No se pudo agregar el evento');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Evento de Tracking</DialogTitle>
          <DialogDescription>
            Agrega un nuevo evento al shipment #{shipmentId}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField>
            <Label htmlFor="type">Tipo de Evento *</Label>
            <Select
              value={type}
              onValueChange={(value) => setValue('type', value as any)}
            >
              <SelectTrigger id="type" aria-invalid={errors.type ? 'true' : 'false'}>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Creado</SelectItem>
                <SelectItem value="packed">Empacado</SelectItem>
                <SelectItem value="picked_up">Recogido</SelectItem>
                <SelectItem value="in_transit">En Tránsito</SelectItem>
                <SelectItem value="out_for_delivery">En Entrega</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
                <SelectItem value="exception">Excepción</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <FormError>{errors.type.message}</FormError>}
          </FormField>

          <FormField>
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="Ciudad, País"
              aria-invalid={errors.location ? 'true' : 'false'}
            />
            {errors.location && <FormError>{errors.location.message}</FormError>}
          </FormField>

          <FormField>
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              {...register('message')}
              placeholder="Mensaje adicional sobre el evento"
              rows={3}
              aria-invalid={errors.message ? 'true' : 'false'}
            />
            {errors.message && <FormError>{errors.message.message}</FormError>}
          </FormField>

          <FormField>
            <Label htmlFor="occurredAt">Fecha y Hora</Label>
            <Input
              id="occurredAt"
              type="datetime-local"
              {...register('occurredAt')}
              aria-invalid={errors.occurredAt ? 'true' : 'false'}
            />
            {errors.occurredAt && <FormError>{errors.occurredAt.message}</FormError>}
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Agregando...' : 'Agregar Evento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

