import { z } from "zod";
import { addDays, format } from "date-fns";
import { CYCLE_LENGTH_DAYS } from "@/constants/constants";

const defaultStart = new Date(new Date().getFullYear(), 8, 1);
const defaultEnd = new Date(new Date().getFullYear() + 1, 5, 30);
const minDate = format(addDays(defaultStart, CYCLE_LENGTH_DAYS - 1), 'yyyy-MM-dd');
const maxDate = format(defaultEnd, 'yyyy-MM-dd');

export const blockedDaySchema = z.object({
  blocked_date: z.iso.date(),
  reason: z.string().min(2),
});

export const blockedDaysSchema = z.array(blockedDaySchema);

export type BlockedDayInsert = z.infer<typeof blockedDaySchema>;

export const blockedDaysCreateSchema = z.object({
  blocked_date: z.iso
    .date()
    .refine((date) => date >= minDate, {
      message: `La date doit être postérieure ou égale à ${minDate}`,
    })
    .refine((date) => date <= maxDate, {
      message: `La date doit être antérieure ou égale à ${maxDate}`,
    }),
  reason: z.string().min(2)
});

export type BlockedDayCreate = z.infer<typeof blockedDaysCreateSchema>;
