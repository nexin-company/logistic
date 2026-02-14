import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es demasiado largo'),
  email: z.string().email('El email no es válido').min(1, 'El email es requerido'),
});

export type UserFormData = z.infer<typeof userSchema>;


