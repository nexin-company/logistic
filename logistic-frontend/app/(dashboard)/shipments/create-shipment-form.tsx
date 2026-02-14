'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FormField, FormError } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/lib/toast';
import { shipmentsApi, CreateShipmentInput } from '@/lib/api';
import { z } from 'zod';

const createShipmentSchema = z.object({
  orderId: z.number().min(1, 'Order ID es requerido'),
  status: z.enum(['pending', 'packed', 'shipped', 'in_transit', 'delivered', 'exception', 'cancelled']).optional(),
  carrier: z.string().optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().url().optional().or(z.literal('')),
});

type CreateShipmentFormData = z.infer<typeof createShipmentSchema>;

interface CreateShipmentFormProps {
  onCreated: () => Promise<void>;
}

export function CreateShipmentForm({ onCreated }: CreateShipmentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateShipmentFormData>({
    resolver: zodResolver(createShipmentSchema),
    defaultValues: {
      status: 'pending',
    },
  });

  const status = watch('status');

  const onSubmit = async (data: CreateShipmentFormData) => {
    try {
      const input: CreateShipmentInput = {
        orderId: data.orderId,
        status: data.status,
        carrier: data.carrier || undefined,
        trackingNumber: data.trackingNumber || undefined,
        trackingUrl: data.trackingUrl || undefined,
      };
      await shipmentsApi.create(input);
      toast.success('Shipment creado', 'El shipment se creó correctamente');
      await onCreated();
    } catch (error: any) {
      console.error('Error al crear shipment:', error);
      toast.error('Error al crear shipment', error.message || 'No se pudo crear el shipment');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField>
        <Label htmlFor="orderId">Order ID *</Label>
        <Input
          id="orderId"
          type="number"
          {...register('orderId', { valueAsNumber: true })}
          placeholder="123"
          aria-invalid={errors.orderId ? 'true' : 'false'}
        />
        {errors.orderId && <FormError>{errors.orderId.message}</FormError>}
      </FormField>

      <FormField>
        <Label htmlFor="status">Estado</Label>
        <Select
          value={status}
          onValueChange={(value) => setValue('status', value as any)}
        >
          <SelectTrigger id="status" aria-invalid={errors.status ? 'true' : 'false'}>
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
        {errors.status && <FormError>{errors.status.message}</FormError>}
      </FormField>

      <FormField>
        <Label htmlFor="carrier">Carrier</Label>
        <Input
          id="carrier"
          {...register('carrier')}
          placeholder="FedEx, DHL, etc."
          aria-invalid={errors.carrier ? 'true' : 'false'}
        />
        {errors.carrier && <FormError>{errors.carrier.message}</FormError>}
      </FormField>

      <FormField>
        <Label htmlFor="trackingNumber">Tracking Number</Label>
        <Input
          id="trackingNumber"
          {...register('trackingNumber')}
          placeholder="1234567890"
          aria-invalid={errors.trackingNumber ? 'true' : 'false'}
        />
        {errors.trackingNumber && <FormError>{errors.trackingNumber.message}</FormError>}
      </FormField>

      <FormField>
        <Label htmlFor="trackingUrl">Tracking URL</Label>
        <Input
          id="trackingUrl"
          type="url"
          {...register('trackingUrl')}
          placeholder="https://..."
          aria-invalid={errors.trackingUrl ? 'true' : 'false'}
        />
        {errors.trackingUrl && <FormError>{errors.trackingUrl.message}</FormError>}
      </FormField>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creando...' : 'Crear Shipment'}
        </Button>
      </div>
    </form>
  );
}

