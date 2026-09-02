import { z } from "zod";

export const blockedDaySchema = z.object({
  blocked_date: z.iso.date(),
  reason: z.string().min(2),
});

export const blockedDaysSchema = z.array(blockedDaySchema);

export type BlockedDayInsert = z.infer<typeof blockedDaySchema>;