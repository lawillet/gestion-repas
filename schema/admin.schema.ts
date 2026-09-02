import { z } from 'zod';

export const updatePriceSchema = z.object({
  price: z
  .coerce
  .number({ error: 'Le prix doit être un nombre.' })
  .positive('La valeur doit être supérieure à 0'),
  portion: z
  .enum(['primary', 'preschool'], { error: 'vous devez choisir une scolarité' }),
  type: z
  .enum(['soup', 'meal'], { error: 'vous devez choisir une scolarité' }),
});

export type UpdatePriceFormValues = z.infer<typeof updatePriceSchema>;