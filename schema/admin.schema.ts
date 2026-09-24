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

export const periodSchema = z.object({
  start_date: z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La date de début doit être au format YYYY-MM-DD'),
  end_date: z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La date de fin doit être au format YYYY-MM-DD'),
  command_lock_date: z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La date de verrouillage doit être au format YYYY-MM-DD'),
});

export type PeriodFormValues = z.infer<typeof periodSchema>;
  