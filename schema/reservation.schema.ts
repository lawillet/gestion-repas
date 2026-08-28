import { z } from 'zod';

export const reservationSchema = z.object({
  blocked_id: z.number().int().positive().nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La date doit être au format YYYY-MM-DD',
  }),
  id_child: z.number().int().positive(),
  meal_id: z.number().int().positive(),
  status: z.boolean().nullable().optional(),
  created_at: z.string().optional(),
  id: z.number().int().positive().optional(),
});

export type ReservationInsert = z.infer<typeof reservationSchema>;
