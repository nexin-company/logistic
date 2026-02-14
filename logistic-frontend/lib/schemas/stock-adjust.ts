import { z } from 'zod';

export const stockAdjustSchema = z.object({
  warehouseId: z.coerce.number().positive('El almacén es requerido'),
  externalProductId: z.coerce.number().positive('El producto externo es requerido'),
  deltaOnHand: z.coerce.number({ invalid_type_error: 'El cambio en stock debe ser un número' }),
  deltaReserved: z.coerce.number().optional(),
  reason: z.string().optional(),
});

export type StockAdjustFormData = z.infer<typeof stockAdjustSchema>;

