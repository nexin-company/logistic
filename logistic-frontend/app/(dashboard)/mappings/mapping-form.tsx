'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormError } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/lib/toast';
import { mappingSchema, type MappingFormData } from '@/lib/schemas/mapping';
import { mappingsApi, CreateMappingInput, type InternalItem, type ExternalProduct } from '@/lib/api';

interface MappingFormProps {
  internalItems: InternalItem[];
  externalProducts: ExternalProduct[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function MappingForm({ internalItems, externalProducts, onSuccess, onCancel }: MappingFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MappingFormData>({
    resolver: zodResolver(mappingSchema),
    defaultValues: {
      internalItemId: undefined,
      externalProductId: undefined,
      note: '',
    },
  });

  const internalItemId = watch('internalItemId');
  const externalProductId = watch('externalProductId');

  const onSubmit = async (data: MappingFormData) => {
    try {
      const createData: CreateMappingInput = {
        internalItemId: data.internalItemId,
        externalProductId: data.externalProductId,
        note: data.note || undefined,
      };
      await mappingsApi.create(createData);
      toast.success('Mapeo creado', 'El mapeo se creó correctamente');
      onSuccess();
    } catch (error: any) {
      console.error('Error al guardar mapeo:', error);
      toast.error('Error al guardar mapeo', error.message || 'No se pudo guardar el mapeo');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField>
        <Label htmlFor="internalItemId">Item Interno *</Label>
        <Select
          value={internalItemId?.toString()}
          onValueChange={(value) => setValue('internalItemId', Number(value))}
        >
          <SelectTrigger id="internalItemId" aria-invalid={errors.internalItemId ? 'true' : 'false'}>
            <SelectValue placeholder="Selecciona un item interno" />
          </SelectTrigger>
          <SelectContent>
            {internalItems.map((item) => (
              <SelectItem key={item.id} value={item.id.toString()}>
                {item.sku} - {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.internalItemId && <FormError>{errors.internalItemId.message}</FormError>}
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
            {externalProducts.map((product) => (
              <SelectItem key={product.id} value={product.id.toString()}>
                {product.sku} - {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.externalProductId && <FormError>{errors.externalProductId.message}</FormError>}
      </FormField>

      <FormField>
        <Label htmlFor="note">Nota</Label>
        <Textarea
          id="note"
          {...register('note')}
          placeholder="Nota sobre el mapeo (opcional)"
          rows={3}
          aria-invalid={errors.note ? 'true' : 'false'}
        />
        {errors.note && <FormError>{errors.note.message}</FormError>}
      </FormField>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}

