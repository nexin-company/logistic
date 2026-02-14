import { z } from 'zod';

export const mappingSchema = z.object({
  internalItemId: z.coerce.number().positive('El ID del item interno es requerido'),
  externalProductId: z.coerce.number().positive('El ID del producto externo es requerido'),
  note: z.string().optional().nullable(),
});

export type MappingFormData = z.infer<typeof mappingSchema>;

