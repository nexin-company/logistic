import { z } from 'zod';

export const externalProductSchema = z.object({
  sku: z.string().min(1, 'El SKU es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
  basePrice: z.coerce.number().positive('El precio base debe ser mayor a 0'),
  currency: z.string().min(1, 'La moneda es requerida').default('MXN'),
});

export type ExternalProductFormData = z.infer<typeof externalProductSchema>;

