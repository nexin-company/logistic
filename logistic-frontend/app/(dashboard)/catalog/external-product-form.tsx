'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField, FormError } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/lib/toast';
import { externalProductSchema, type ExternalProductFormData } from '@/lib/schemas/external-product';
import { ExternalProduct, catalogApi, CreateExternalProductInput, UpdateExternalProductInput } from '@/lib/api';

interface ExternalProductFormProps {
  externalProduct?: ExternalProduct | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ExternalProductForm({ externalProduct, onSuccess, onCancel }: ExternalProductFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExternalProductFormData>({
    resolver: zodResolver(externalProductSchema),
    defaultValues: {
      sku: externalProduct?.sku || '',
      name: externalProduct?.name || '',
      status: externalProduct?.status || 'active',
      basePrice: externalProduct?.basePrice ?? 0,
      currency: externalProduct?.currency || 'MXN',
    },
  });

  const status = watch('status');

  const onSubmit = async (data: ExternalProductFormData) => {
    try {
      if (externalProduct) {
        const updateData: UpdateExternalProductInput = {
          sku: data.sku,
          name: data.name,
          status: data.status,
          basePrice: data.basePrice,
          currency: data.currency,
        };
        await catalogApi.update(externalProduct.id, updateData);
        toast.success('Producto externo actualizado', 'Los cambios se guardaron correctamente');
      } else {
        const createData: CreateExternalProductInput = {
          sku: data.sku,
          name: data.name,
          status: data.status,
          basePrice: data.basePrice,
          currency: data.currency,
        };
        await catalogApi.create(createData);
        toast.success('Producto externo creado', 'El producto externo se creó correctamente');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error al guardar producto externo:', error);
      toast.error('Error al guardar producto externo', error.message || 'No se pudo guardar el producto externo');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField>
        <Label htmlFor="sku">SKU *</Label>
        <Input id="sku" {...register('sku')} placeholder="SKU del producto" aria-invalid={errors.sku ? 'true' : 'false'} />
        {errors.sku && <FormError>{errors.sku.message}</FormError>}
      </FormField>

      <FormField>
        <Label htmlFor="name">Nombre *</Label>
        <Input id="name" {...register('name')} placeholder="Nombre del producto" aria-invalid={errors.name ? 'true' : 'false'} />
        {errors.name && <FormError>{errors.name.message}</FormError>}
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField>
          <Label htmlFor="basePrice">Precio Base *</Label>
          <Input 
            id="basePrice" 
            type="number" 
            step="0.01"
            {...register('basePrice')} 
            placeholder="0.00" 
            aria-invalid={errors.basePrice ? 'true' : 'false'} 
          />
          {errors.basePrice && <FormError>{errors.basePrice.message}</FormError>}
        </FormField>

        <FormField>
          <Label htmlFor="currency">Moneda *</Label>
          <Input id="currency" {...register('currency')} placeholder="MXN" aria-invalid={errors.currency ? 'true' : 'false'} />
          {errors.currency && <FormError>{errors.currency.message}</FormError>}
        </FormField>
      </div>

      <FormField>
        <Label htmlFor="status">Estado</Label>
        <Select
          value={status}
          onValueChange={(value) => setValue('status', value as 'active' | 'inactive' | 'archived')}
        >
          <SelectTrigger id="status" aria-invalid={errors.status ? 'true' : 'false'}>
            <SelectValue placeholder="Selecciona un estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="inactive">Inactivo</SelectItem>
            <SelectItem value="archived">Archivado</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && <FormError>{errors.status.message}</FormError>}
      </FormField>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : externalProduct ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}

